"""Generates the canvas hashes in headless Firefox on a local http:// page (no noise seed, so Firefox's own
per-session canvas randomization applies) and feeds them into generate_token."""
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

from canvas_hashes import generate_canvas_hashes
from generate_token import generate_token, new_nonce


class _Page(BaseHTTPRequestHandler):
    def do_GET(self):
        body = b"<!doctype html><title>canvas</title>"
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


def canvas_hashes_from_http_page():
    server = ThreadingHTTPServer(("127.0.0.1", 0), _Page)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        return generate_canvas_hashes(page_url=f"http://127.0.0.1:{server.server_port}/")
    finally:
        server.shutdown()


if __name__ == "__main__":
    hashes = canvas_hashes_from_http_page()
    now_ms = int(time.time() * 1000)
    token = generate_token(
        sst=bytes.fromhex("0501090807"),   # placeholder: use the session's real sst
        server_time=now_ms // 1000,
        start=now_ms,
        canvas_a=hashes.i_ca,
        canvas_b=hashes.i_cb,
        persistent_id=1234567,             # placeholder: use the session's real id
        nonce=new_nonce(),
        url="/api/x?y=1",                  # placeholder: the request's path and query
    )
    print(hashes)
    print(token)
