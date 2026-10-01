import json
import os
import shutil
import socket
import subprocess
import sys
import threading
from pathlib import Path

import pytest

current_directory = Path(__file__).parent.absolute()
source_directory = (current_directory / "..").resolve()
sys.path.insert(0, str(source_directory / "main"))

import canvas_hashes  # noqa: E402
from canvas_hashes import CanvasHashes, generate_canvas_hashes  # noqa: E402

NODE_CLI = (source_directory / ".." / "javascript" / "cli" / "canvas-hashes.js").resolve()
HAS_FIREFOX = any(os.path.exists(p) for p in [os.environ.get("FIREFOX_BIN", ""), *canvas_hashes._FIREFOX_CANDIDATES]) \
    or shutil.which("firefox") is not None
needs_firefox = pytest.mark.skipif(not HAS_FIREFOX, reason="Firefox is not installed")


def node_hashes(*args):
    out = subprocess.run(["node", str(NODE_CLI), *args], check=True, capture_output=True, text=True, timeout=90).stdout
    data = json.loads(out)
    return CanvasHashes(data["canvasA"], data["canvasB"], 1 if data["canvasRandomised"] else 0)


@pytest.mark.parametrize("seed", [-1, 2 ** 32, 1.5, "7", True, float("nan")])
def test_a_bad_noise_seed_is_rejected_before_a_browser_starts(seed):
    with pytest.raises(ValueError):
        generate_canvas_hashes(seed)


def test_the_page_code_is_read_from_the_file_shared_with_node():
    text = canvas_hashes.PAGE_SCRIPT.read_text(encoding="utf-8")
    assert "function drawCanvases" in text and "function installNoise" in text
    assert "b3-FP-v1-alpha" in text and "x9-FP-v1-bravo" in text


def test_remote_values_are_converted_to_plain_python():
    remote = {"type": "object", "value": [
        ["urlA", {"type": "string", "value": "data:image/png;base64,AA"}],
        ["urlB", {"type": "null"}],
        ["differs", {"type": "boolean", "value": False}],
    ]}
    assert canvas_hashes._from_remote(remote) == {"urlA": "data:image/png;base64,AA", "urlB": None, "differs": False}


def test_a_missing_2d_context_hashes_to_zero_and_a_url_to_fnv1a32():
    assert canvas_hashes._hash_url(None) == 0
    assert canvas_hashes._hash_url("a") == canvas_hashes.fnv1a32("a")


@needs_firefox
def test_the_result_is_two_unsigned_32_bit_hashes_and_stable_between_runs():
    first = generate_canvas_hashes()
    assert all(0 <= value <= 0xFFFFFFFF for value in (first.i_ca, first.i_cb))
    assert first.i_ca != first.i_cb
    assert generate_canvas_hashes() == first


@needs_firefox
def test_a_noise_seed_is_reproducible_changes_the_hashes_and_keeps_i_cr_at_zero():
    plain = generate_canvas_hashes()
    seeded = generate_canvas_hashes(12345)
    other = generate_canvas_hashes(54321)
    assert generate_canvas_hashes(12345) == seeded
    assert seeded.i_cr == 0 and other.i_cr == 0
    assert seeded.i_ca != plain.i_ca and seeded.i_cb != plain.i_cb
    assert other.i_ca != seeded.i_ca and other.i_cb != seeded.i_cb


def test_fake_page_url_cannot_be_combined_with_page_url():
    with pytest.raises(ValueError):
        generate_canvas_hashes(fake_page_url="https://www.example.test/", page_url="http://127.0.0.1/")


@needs_firefox
def test_a_fake_page_url_is_served_in_the_browser_and_never_requested():
    plain = generate_canvas_hashes()
    listener = socket.socket()
    listener.bind(("127.0.0.1", 0))
    listener.listen(50)
    requests = []

    def accept():
        while True:
            try:
                connection, _ = listener.accept()
            except OSError:
                return
            requests.append(connection.recv(300))
            connection.close()

    threading.Thread(target=accept, daemon=True).start()
    port = listener.getsockname()[1]
    try:
        # the safety-net proxy is replaced by a counter: whatever escapes the interception would land here
        hashes = generate_canvas_hashes(fake_page_url="https://www.example.test/a/b?c=1#d",
                                        prefs={"network.proxy.http_port": port, "network.proxy.ssl_port": port})
    finally:
        listener.close()
    assert not [r for r in requests if b"example.test" in r]
    assert (hashes.i_ca, hashes.i_cb) != (plain.i_ca, plain.i_cb)  # treated as a web page: Firefox's canvas noise applies
    assert hashes.i_cr == 0


@needs_firefox
@pytest.mark.skipif(shutil.which("node") is None, reason="node is not installed")
@pytest.mark.parametrize("args, seed", [((), None), (("--noise-seed", "12345"), 12345)])
def test_python_and_node_give_the_same_values(args, seed):
    assert generate_canvas_hashes(seed) == node_hashes(*args)
