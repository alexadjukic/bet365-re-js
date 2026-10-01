"""Offline generator for the two canvas hashes of the token: f.i_ca and f.i_cb (and the noise flag f.i_cr).

Python port of mitmproxy/src/javascript/canvas-hash/canvas-hash.js. The site's function (fn_56655 in build 16504,
fn_56921 in 16520 and 16528 of received-32.js) draws two separate 280x60 canvases with the same picture and a
different text, then hashes `canvas.toDataURL()` with fnv1a32. The pixels depend on the browser that renders them,
so the drawing runs in a real headless Firefox (the captures were made with Firefox 156 on Linux). Firefox is
started with a throw-away profile and driven through WebDriver BiDi; only about:blank is opened, nothing is
requested from any site.

The code that runs in the page is NOT duplicated here: it is read from
mitmproxy/src/javascript/canvas-hash/canvas-page.js, the file the Node implementation uses too, so both give the same
values for the same seed.

    from canvas_hashes import generate_canvas_hashes
    i_ca, i_cb, i_cr = generate_canvas_hashes(noise_seed=12345)

Needs the `websockets` package (requirements.txt) and Firefox (path via firefox_path, FIREFOX_BIN or the usual
locations).
"""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from typing import NamedTuple, Optional

from websockets.sync.client import connect

try:
    from .generate_token import fnv1a32
except ImportError:  # imported as a top-level module with mitmproxy/src/python/main on sys.path
    from generate_token import fnv1a32

PAGE_SCRIPT = Path(__file__).resolve().parents[2] / "javascript" / "canvas-hash" / "canvas-page.js"

_FIREFOX_CANDIDATES = (
    "/usr/bin/firefox", "/usr/local/bin/firefox", "/Applications/Firefox.app/Contents/MacOS/firefox",
    r"C:\Program Files\Mozilla Firefox\firefox.exe",
)
_BIDI_ENDPOINT = re.compile(r"WebDriver BiDi listening on (ws://\S+)")


class CanvasHashes(NamedTuple):
    """i_ca / i_cb: unsigned 32-bit integers as sent in the token. i_cr: 1 if two consecutive toDataURL() calls
    of canvas A differed (canvas noise), else 0."""
    i_ca: int
    i_cb: int
    i_cr: int


def _find_firefox(explicit: Optional[str]) -> str:
    for candidate in (explicit, os.environ.get("FIREFOX_BIN"), *_FIREFOX_CANDIDATES, shutil.which("firefox")):
        if candidate and os.path.exists(candidate):
            return candidate
    raise FileNotFoundError("Firefox not found: install it or pass firefox_path / set FIREFOX_BIN")


def _launch_firefox(firefox_path: str, timeout: float, prefs: dict,
                    source_profile: Optional[str] = None) -> tuple[subprocess.Popen, str, str]:
    """Starts a headless Firefox with a throw-away profile; returns (process, BiDi endpoint, profile dir).

    With source_profile the throw-away profile is a copy of that profile (extensions and settings included)."""
    profile = tempfile.mkdtemp(prefix="canvas-hash-")
    if source_profile:
        shutil.copytree(source_profile, profile, dirs_exist_ok=True, symlinks=True, ignore=shutil.ignore_patterns(
            "lock", ".parentlock", "cache2", "startupCache", "crashes", "minidumps", "sessionstore-backups"))
    Path(profile, "user.js").write_text(
        "".join(f"user_pref({json.dumps(name)}, {json.dumps(value)});\n" for name, value in prefs.items()))
    log_path = Path(profile, "firefox.log")
    with open(log_path, "w") as log:
        process = subprocess.Popen(
            [firefox_path, "--headless", "--no-remote", "--profile", profile, "--remote-debugging-port", "0",
             "about:blank"],
            stdin=subprocess.DEVNULL, stdout=subprocess.DEVNULL, stderr=log)
    deadline = time.monotonic() + timeout
    while time.monotonic() < deadline:
        match = _BIDI_ENDPOINT.search(log_path.read_text(errors="replace"))
        if match:
            return process, match.group(1), profile
        if process.poll() is not None:
            break
        time.sleep(0.05)
    output = log_path.read_text(errors="replace")
    _stop(process, profile)
    raise RuntimeError(f"Firefox did not open its BiDi endpoint within {timeout} s\n{output}")


def _stop(process: subprocess.Popen, profile: str) -> None:
    process.kill()
    process.wait()
    shutil.rmtree(profile, ignore_errors=True)


class _Bidi:
    """Minimal WebDriver BiDi client: send(method, params) returns the command's result."""

    def __init__(self, endpoint: str, timeout: float):
        self._connection = connect(endpoint, open_timeout=timeout, max_size=None)
        self._timeout = timeout
        self._next_id = 1

    def __enter__(self) -> "_Bidi":
        self._socket = self._connection.__enter__()
        return self

    def __exit__(self, *exc_info) -> None:
        self._connection.__exit__(*exc_info)

    def send(self, method: str, params: Optional[dict] = None) -> dict:
        command_id, self._next_id = self._next_id, self._next_id + 1
        self._socket.send(json.dumps({"id": command_id, "method": method, "params": params or {}}))
        while True:
            message = json.loads(self._socket.recv(timeout=self._timeout))
            if message.get("id") != command_id:  # an event, or the answer to something else
                continue
            if message.get("type") == "error":
                raise RuntimeError(f"{message['error']}: {message['message']}")
            return message["result"]


def _from_remote(value: Optional[dict]):
    """Converts a BiDi RemoteValue (object/array/string/boolean/null) into a plain Python value."""
    if not value:
        return None
    kind = value["type"]
    if kind in ("null", "undefined"):
        return None
    if kind == "object":
        return {key: _from_remote(item) for key, item in value["value"]}
    if kind == "array":
        return [_from_remote(item) for item in value["value"]]
    return value.get("value")


def _hash_url(url: Optional[str]) -> int:
    return 0 if url is None else fnv1a32(url)  # the VM keeps its hash at 0 when the 2d context is missing


def generate_canvas_hashes(
    noise_seed: Optional[int] = None,
    *,
    firefox_path: Optional[str] = None,
    timeout: float = 30.0,
    prefs: Optional[dict] = None,
    profile: Optional[str] = None,
    page_url: Optional[str] = None,
) -> CanvasHashes:
    """Draws the two canvases in a headless Firefox and returns CanvasHashes(i_ca, i_cb, i_cr).

    noise_seed  an unsigned 32-bit integer. Simulates a browser with per-session canvas noise: the same seed always
                gives the same hashes, another seed gives other hashes, i_cr stays 0. None returns the plain
                rendering of this browser.
    prefs       about:config preferences written to the throw-away profile's user.js, e.g.
                {"privacy.resistFingerprinting": True}.
    profile     path of an existing Firefox profile to copy (the original is never touched), e.g. to measure what
                the extensions installed in it do to the canvases.
    page_url    page to load before drawing. Extensions only run on web pages, so use an http(s) URL (a local
                server is fine) when testing them; the default about:blank is not touched by any extension.
    """
    if noise_seed is not None and not (
            isinstance(noise_seed, int) and not isinstance(noise_seed, bool) and 0 <= noise_seed <= 0xFFFFFFFF):
        raise ValueError(f"noise_seed must be an unsigned 32-bit integer, got {noise_seed!r}")

    noise = "" if noise_seed is None else f"installNoise({noise_seed});"
    declaration = ("() => {\n" + PAGE_SCRIPT.read_text(encoding="utf-8") + "\n" + noise
                   + "\nreturn drawCanvases(CANVAS_A_TEXT, CANVAS_B_TEXT);\n}")

    process, endpoint, run_profile = _launch_firefox(_find_firefox(firefox_path), timeout, prefs or {}, profile)
    try:
        with _Bidi(f"{endpoint}/session", timeout) as client:
            client.send("session.new", {"capabilities": {}})
            context = client.send("browsingContext.getTree")["contexts"][0]["context"]
            if page_url:
                client.send("browsingContext.navigate", {"context": context, "url": page_url, "wait": "complete"})
            result = client.send("script.callFunction", {
                "functionDeclaration": declaration,
                "target": {"context": context},
                "awaitPromise": False,
                "resultOwnership": "none",
                "serializationOptions": {"maxObjectDepth": 2},
            })
        if result["type"] != "success":
            raise RuntimeError(f"script failed: {json.dumps(result.get('exceptionDetails'))}")
        drawn = _from_remote(result["result"])
        return CanvasHashes(_hash_url(drawn["urlA"]), _hash_url(drawn["urlB"]), 1 if drawn["differs"] else 0)
    finally:
        _stop(process, run_profile)


def main(argv: Optional[list[str]] = None) -> int:
    import argparse

    parser = argparse.ArgumentParser(description="Print the canvas hashes of this machine's headless Firefox as JSON.")
    parser.add_argument("--noise-seed", type=int, help="simulate per-session canvas noise (unsigned 32-bit integer)")
    parser.add_argument("--firefox", help="path to the Firefox binary")
    args = parser.parse_args(argv)
    hashes = generate_canvas_hashes(args.noise_seed, firefox_path=args.firefox)
    print(json.dumps({"canvasA": hashes.i_ca, "canvasB": hashes.i_cb, "canvasRandomised": hashes.i_cr == 1}, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
