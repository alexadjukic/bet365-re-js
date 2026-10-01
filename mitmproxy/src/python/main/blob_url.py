#!/usr/bin/env python3
"""Rebuild the URL of the big module blob request of bet365.rs from the initial page, and fetch it.

    from blob_url import extract_config, build_blob_url, Bet365Client
    config = extract_config(html)                  # parses the inline WebsiteConfig of the page, no network
    build_blob_url(config, lng="37")               # -> "/Api/1/Blob?37,www-sports,brl/24/SL%7Clog/14/%7C...%7Ccwc/744/"

    venv/bin/python mitmproxy/src/python/main/blob_url.py          # LIVE: GET https://www.bet365.rs/, then the blob URL

Only the command line above touches the network (and only when you run it); the tests mock the transport and read the captured
page of output/ or of the flows files.

How the browser builds the URL (boot script of the page, `se()` and the `BatchedModuleUrls` branch; notes in
data/notes/chunk-explanations.md):

    BLOB_LOCATION + lng + "," + SITE_NAME + "," + module/version/[S][L] %7C module/version/[S][L] ... %7C cwc/<CW version>/

  * BLOB_LOCATION, SITE_NAME, SFBP, SITE_PRELOAD and CW are in the inline `WebsiteConfig` JSON of the page,
  * `lng` is the `lng` attribute of the `aps03` cookie that the page response sets (`"1"` if there is none),
  * SITE_PRELOAD gives the order of the modules; `rll` is requested on its own and left out, entries with `c` of `y` or `c`
    are kept (`a` is for the app only), `f & 2` adds `S`, `f & 1` adds `L`,
  * CW entries (`{"M": "cwc", "V": "744"}`) are appended last; the version of `cwc` is the variable last number.

Anything unexpected (an inline value is missing, the boot script no longer looks like the one this was written from, the site asks
for one request per module with SFBP > 0) raises BlobUrlError; nothing is guessed.
"""
import gzip
import http.cookiejar
import json
import re
import sys
import urllib.parse
import urllib.request
from typing import Optional

PAGE_URL = "https://www.bet365.rs/"
USER_AGENT = "Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0"
DELIMITER = "%7C"  # boot.getBlobDelimiter() on the web ("|" in the native app)
CSS_FLAG, LANGUAGE_FLAG = 2, 1

# Inline values of the page and how to read them: the raw JSON value after `"KEY":`.
REQUIRED_KEYS = ("BLOB_LOCATION", "SITE_NAME", "SFBP", "SITE_PRELOAD", "CW")

# Pieces of the boot script this code mirrors. If one is gone, the build changed the logic and the output cannot be trusted.
BOOT_SCRIPT_MARKERS = {
    "base url": re.compile(r'BLOB_LOCATION\+\(\w+\|\|"1"\)\+","\+\w+\.WebsiteConfig\.SITE_NAME\+","'),
    "lng cookie": re.compile(r'GetCookieAttributeValue\("aps03","lng"\)'),
    "rll is requested on its own": re.compile(r'"rll"===\w+\[\w+\]\.m'),
    "preload filter": re.compile(r'"y"===\w+\.c\|\|\w+\.isAppRequest&&"a"==\w+\.c\|\|"c"==\w+\.c'),
    "CW is appended": re.compile(r'for\((?:const |let |var )?\w+ of \w+\.WebsiteConfig\.CW\)\w+\+=""\+\w+\(\)\+\w+\.M\+`/\$\{\w+\.V\}/`'),
    "S and L flags": re.compile(r'2&\w+\.f&&\(\w+\+="S"[^)]*\),1&\w+\.f&&\(\w+\+="L"'),
}


class BlobUrlError(Exception):
    pass


def extract_json_value(html: str, key: str):
    """The JSON value that follows `"key":` in the page, or raise."""
    marker = f'"{key}":'
    start = html.find(marker)
    if start < 0:
        raise BlobUrlError(f"{key} not found in the page")
    try:
        value, _ = json.JSONDecoder().raw_decode(html, start + len(marker))
    except ValueError as error:
        raise BlobUrlError(f"{key} is not valid JSON: {error}") from error
    return value


def check_boot_script(html: str) -> None:
    missing = [name for name, pattern in BOOT_SCRIPT_MARKERS.items() if not pattern.search(html)]
    if missing:
        raise BlobUrlError("the boot script differs from the one this code mirrors, missing: " + ", ".join(missing))


def extract_config(html: str, check_script: bool = True) -> dict:
    """The parameters that decide the blob URL, from the initial HTML (inline JSON, plus a check of the boot script)."""
    if check_script:
        check_boot_script(html)
    config = {key: extract_json_value(html, key) for key in REQUIRED_KEYS}
    if not isinstance(config["SITE_PRELOAD"], list) or not isinstance(config["CW"], list):
        raise BlobUrlError("SITE_PRELOAD and CW must be lists")
    return config


def lng_from_cookie(cookie_value: Optional[str]) -> Optional[str]:
    """`ct=240&lng=37` -> `37` (value of the aps03 cookie)."""
    if not cookie_value:
        return None
    values = urllib.parse.parse_qs(cookie_value).get("lng")
    return values[0] if values else None


def module_part(name: str, entry: dict, manifest: Optional[dict] = None) -> str:
    """`se()` of the boot script: name/version/ plus S (CSS) and L (language). An entry without a numeric version falls back to
    the manifest (`/manifestapi/getmanifest`, `m[name]`), as the script does."""
    if not re.fullmatch(r"\d+", str(entry.get("v", ""))):
        if not manifest or name not in manifest.get("m", {}):
            raise BlobUrlError(f"{name} has no numeric version and no manifest entry")
        entry = manifest["m"][name]
    flags = entry.get("f", 0)
    return f"{name}/{entry['v']}/" + ("S" if flags & CSS_FLAG else "") + ("L" if flags & LANGUAGE_FLAG else "")


def build_blob_url(config: dict, lng: Optional[str] = None, manifest: Optional[dict] = None, host: str = "") -> str:
    """The path (`host` is prepended if given, e.g. "https://www.bet365.rs") of the big `brl/...|cwc/<n>/` blob request."""
    if config["SFBP"]:
        raise BlobUrlError("SFBP > 0: the site loads one URL per module (SingleModuleUrls), there is no big URL")
    parts = []
    for entry in config["SITE_PRELOAD"]:
        if entry["m"] == "rll":
            continue
        if entry.get("c") in ("y", "c"):
            parts.append(module_part(entry["m"], entry, manifest))
    parts += [f"{entry['M']}/{entry['V']}/" for entry in config["CW"]]
    if not parts:
        raise BlobUrlError("no modules")
    return f"{host}{config['BLOB_LOCATION']}{lng or '1'},{config['SITE_NAME']},{DELIMITER.join(parts)}"


class Bet365Client:
    """Fetches the page and the blob with a cookie jar. `opener` is anything with `open(request, timeout=...)` returning an object
    with `.read()`, `.status` and `.headers` (a urllib opener by default); tests pass a fake one."""

    def __init__(self, opener=None, user_agent: str = USER_AGENT, base: str = PAGE_URL):
        self.cookies = http.cookiejar.CookieJar()
        self.opener = opener or urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.cookies))
        self.user_agent = user_agent
        self.base = base

    def get(self, url: str, headers: Optional[dict] = None, timeout: float = 30) -> bytes:
        request_headers = {"User-Agent": self.user_agent, "Accept-Language": "en-US,en;q=0.9", "Accept-Encoding": "gzip"}
        request_headers.update(headers or {})
        with self.opener.open(urllib.request.Request(url, headers=request_headers), timeout=timeout) as response:
            if response.status != 200:
                raise BlobUrlError(f"{url} answered {response.status}")
            body = response.read()
            return gzip.decompress(body) if response.headers.get("Content-Encoding") == "gzip" else body

    def fetch_page(self) -> str:
        return self.get(self.base, {"Accept": "text/html,application/xhtml+xml,*/*;q=0.8"}).decode("utf-8")

    def lng(self) -> Optional[str]:
        return next((lng_from_cookie(c.value) for c in self.cookies if c.name == "aps03"), None)

    def fetch_blob(self, url: str) -> bytes:
        return self.get(url, {"Accept": "*/*", "Referer": self.base})

    def run(self) -> tuple:
        """page -> parameters -> URL -> blob. Returns (url, body)."""
        config = extract_config(self.fetch_page())
        url = build_blob_url(config, self.lng(), host=self.base.rstrip("/"))
        return url, self.fetch_blob(url)


def main() -> int:
    url, body = Bet365Client().run()
    print(url)
    print(f"{len(body)} bytes", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
