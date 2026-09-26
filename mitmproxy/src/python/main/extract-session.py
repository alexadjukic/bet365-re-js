#!/usr/bin/env python3
"""Extract the X-Net-Sync-Term inputs and tokens of one browsing session from a mitmproxy flows file.

    venv/bin/python mitmproxy/src/python/main/extract-session.py <flows> <out.json>

The output has the layout of data/captures/tokens.json (SST from the page, SST_CONFIG from the
/defaultapi/sports-configuration response, SERVER_TIME, CW, TTI, SSI, user-agent, tokens) plus what a flows
file adds: the session cookies, the per-load `_h` value, request times (`ts`, epoch seconds as seen by mitmproxy) and, for
websocket tokens, the message time, type byte and topic list. Tokens come from the `x-net-sync-term` request header and from
the `A_<token>` part of client websocket messages.
"""
import json
import re
import sys

from mitmproxy import io

CONFIG_PATH = "/defaultapi/sports-configuration"


def page_value(html, pattern):
    match = re.search(pattern, html)
    return match.group(1) if match else None


def websocket_tokens(message):
    """Tokens (A_<base64>) in one client message. The token ends at a comma or at the end of the message; topics such as
    `201149837C1A_37` also contain `A_`, so the marker must not follow an identifier character and the value must be long."""
    return re.findall(rb"(?<![A-Za-z0-9_])A_([A-Za-z0-9+/=]{100,})", message)


def extract(flows):
    out = {"tokens": []}
    for flow in flows:
        if flow.type != "http":
            continue
        request, response = flow.request, flow.response
        if request.path == "/" and request.host.startswith("www.") and response and response.status_code == 200 and "SST" not in out:
            html = response.get_text()
            out.update({
                "page_ts": request.timestamp_start,
                "SST": page_value(html, r'"SST":"([^"]+)"'),
                "SERVER_TIME": int(page_value(html, r'"SERVER_TIME":(\d+)')),
                "CW": json.loads(page_value(html, r'"CW":(\[[^\]]*\])')),
                "TTI": page_value(html, r'"TTI":(\w+)') == "true",
                "SSI": page_value(html, r'"SSI":"([^"]+)"'),
                "_h": page_value(html, r"_h=([^\"&]+)"),
                "SITE_VERSION": None,
            })
        elif request.path.startswith(CONFIG_PATH) and response and "SST_CONFIG" not in out:
            wc = json.loads(response.get_text())["ns_weblib_util"]["WebsiteConfig"]
            out.update({
                "config_ts": request.timestamp_start,
                "SST_CONFIG": wc["SST"],
                "config_request_cookie": request.headers.get("cookie"),
                "config_set_cookie": response.headers.get_all("set-cookie"),
            })
        if "getmanifest" in request.path and out.get("SITE_VERSION") is None:
            out["SITE_VERSION"] = int(re.search(r"[?&]v=(\d+)", request.path).group(1))
        if "user-agent" not in out and request.headers.get("user-agent"):
            out["user-agent"] = request.headers["user-agent"]
        value = request.headers.get("x-net-sync-term")
        if value:
            out["tokens"].append({"value": value, "url": request.pretty_url, "method": request.method,
                                  "body": request.get_text() or None, "ts": request.timestamp_start})
        if flow.websocket:
            for message in flow.websocket.messages:
                if message.from_client:
                    for token in websocket_tokens(message.content):
                        # the message is <type byte><flags byte><comma-separated topics>,A_<token>; 0x16 subscribes, 0x17 unsubscribes
                        head = message.content[: message.content.find(b"A_" + token)]
                        out["tokens"].append({"value": token.decode(), "url": request.pretty_url, "method": "WS",
                                              "body": None, "ts": message.timestamp,
                                              "message_type": head[0], "topics": head[2:].rstrip(b",").decode("latin1")})
    out["tokens"].sort(key=lambda t: t["ts"])
    return out


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    with open(sys.argv[1], "rb") as handle:
        session = extract(io.FlowReader(handle).stream())
    with open(sys.argv[2], "w") as handle:
        json.dump(session, handle, indent=1)
    print(f"{len(session['tokens'])} tokens, SST_CONFIG {'found' if session.get('SST_CONFIG') else 'MISSING'}")
