"""Offline generator for the two canvas hashes of the token: f.i_ca and f.i_cb (and the noise flag f.i_cr).

Python port of mitmproxy/src/javascript/canvas-hash/canvas-hash.js. The site's function (fn_56655 in build 16504,
fn_56921 in 16520 and 16528 of received-32.js) draws two separate 280x60 canvases with the same picture and a
different text, then hashes `canvas.toDataURL()` with fnv1a32. The pixels depend on the browser that renders them,
so the drawing runs in a real headless Firefox (the captures were made with Firefox 156 on Linux). Firefox is
started with a throw-away profile and driven through WebDriver BiDi; by default only about:blank is opened. With
fake_page_url the browser believes it is on that address but every request is answered inside the browser (BiDi
network interception), so nothing is requested from any site.

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
from urllib.parse import urldefrag

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

    def send_nowait(self, method: str, params: Optional[dict] = None) -> int:
        """Sends a command without waiting for its answer (the answer is dropped by send()'s read loop)."""
        command_id, self._next_id = self._next_id, self._next_id + 1
        self._socket.send(json.dumps({"id": command_id, "method": method, "params": params or {}}))
        return command_id

    def send(self, method: str, params: Optional[dict] = None, on_event=None) -> dict:
        """Sends a command and returns its result; on_event(method, params) sees every event received meanwhile."""
        command_id = self.send_nowait(method, params)
        while True:
            message = json.loads(self._socket.recv(timeout=self._timeout))
            if message.get("type") == "event":
                if on_event:
                    on_event(message["method"], message["params"])
                continue
            if message.get("id") != command_id:  # the answer to a send_nowait command
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


PLACEHOLDER_HTML = "<!doctype html><html><head><meta charset=\"utf-8\"><title>placeholder</title></head><body></body></html>"

# Safety net for fake_page_url: every request that is not intercepted (there should be none) goes to a closed port.
_DEAD_PROXY_PREFS = {
    "network.proxy.type": 1, "network.proxy.http": "127.0.0.1", "network.proxy.http_port": 9,
    "network.proxy.ssl": "127.0.0.1", "network.proxy.ssl_port": 9, "network.proxy.no_proxies_on": "",
    "network.proxy.allow_hijacking_localhost": True,
}


def _serve_placeholder(client: "_Bidi", fake_page_url: str, html: str):
    """Returns an event handler that answers every request in the browser itself: the page URL gets the placeholder
    HTML, anything else (favicon, ...) an empty 404. No request is ever continued, so nothing is sent to the network."""
    page = urldefrag(fake_page_url).url

    def on_event(method: str, params: dict) -> None:
        if method != "network.beforeRequestSent" or not params.get("isBlocked"):
            return
        is_page = urldefrag(params["request"]["url"]).url == page
        client.send_nowait("network.provideResponse", {
            "request": params["request"]["request"],
            "statusCode": 200 if is_page else 404,
            "reasonPhrase": "OK" if is_page else "Not Found",
            "headers": [{"name": "Content-Type", "value": {"type": "string", "value": "text/html; charset=utf-8"}}],
            "body": {"type": "string", "value": html if is_page else ""},
        })

    return on_event


def generate_canvas_hashes(
    noise_seed: Optional[int] = None,
    *,
    firefox_path: Optional[str] = None,
    timeout: float = 30.0,
    prefs: Optional[dict] = None,
    profile: Optional[str] = None,
    page_url: Optional[str] = None,
    fake_page_url: Optional[str] = None,
    fake_page_html: str = PLACEHOLDER_HTML,
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
    fake_page_url
                a URL the browser believes it is visiting (e.g. "https://www.example.test/"). Nothing is requested
                from it: every request is answered inside the browser with fake_page_html, and a dead proxy is
                set as a safety net. The canvas noise depends on the site, so this gives the pair of that host.
                Cannot be combined with page_url.
    """
    if fake_page_url and page_url:
        raise ValueError("fake_page_url and page_url cannot be combined")
    if noise_seed is not None and not (
            isinstance(noise_seed, int) and not isinstance(noise_seed, bool) and 0 <= noise_seed <= 0xFFFFFFFF):
        raise ValueError(f"noise_seed must be an unsigned 32-bit integer, got {noise_seed!r}")

    noise = "" if noise_seed is None else f"installNoise({noise_seed});"
    declaration = ("() => {\n" + PAGE_SCRIPT.read_text(encoding="utf-8") + "\n" + noise
                   + "\nreturn drawCanvases(CANVAS_A_TEXT, CANVAS_B_TEXT);\n}")

    all_prefs = {**(_DEAD_PROXY_PREFS if fake_page_url else {}), **(prefs or {})}
    process, endpoint, run_profile = _launch_firefox(_find_firefox(firefox_path), timeout, all_prefs, profile)
    try:
        with _Bidi(f"{endpoint}/session", timeout) as client:
            client.send("session.new", {"capabilities": {}})
            context = client.send("browsingContext.getTree")["contexts"][0]["context"]
            on_event = None
            if fake_page_url:
                on_event = _serve_placeholder(client, fake_page_url, fake_page_html)
                client.send("session.subscribe", {"events": ["network.beforeRequestSent"]})
                client.send("network.addIntercept", {"phases": ["beforeRequestSent"]})
            if page_url or fake_page_url:
                client.send("browsingContext.navigate",
                            {"context": context, "url": page_url or fake_page_url, "wait": "complete"}, on_event)
            result = client.send("script.callFunction", {
                "functionDeclaration": declaration,
                "target": {"context": context},
                "awaitPromise": False,
                "resultOwnership": "none",
                "serializationOptions": {"maxObjectDepth": 2},
            }, on_event)
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
