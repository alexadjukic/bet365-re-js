"""Generates the canvas hashes in headless Firefox that believes it is on the bet365 address below (no noise seed, so
Firefox's own per-site, per-session canvas randomization applies) and feeds them into generate_token.

FAKE_PAGE_URL is never requested: canvas_hashes answers every request inside the browser with placeholder HTML and
sets a dead proxy as a safety net."""
import time

from canvas_hashes import generate_canvas_hashes
from generate_token import generate_token, new_nonce

FAKE_PAGE_URL = "https://www.bet365.rs/"

if __name__ == "__main__":
    hashes = generate_canvas_hashes(fake_page_url=FAKE_PAGE_URL)
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
