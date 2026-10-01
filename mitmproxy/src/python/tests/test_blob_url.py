import gzip
import io
import sys
from pathlib import Path

import pytest

current_directory = Path(__file__).parent.absolute()
source_directory = (current_directory / "..").resolve()
sys.path.insert(0, str(source_directory / "main"))

import blob_url  # noqa: E402
from blob_url import Bet365Client, BlobUrlError, build_blob_url, extract_config, lng_from_cookie  # noqa: E402

OUTPUT_PAGE = "1789578235.1683433-html.html"
OUTPUT_PAGE_URL = (
    "/Api/1/Blob?37,www-sports,brl/23/SL%7Clog/13/%7Cuic/8/%7Cdtl/12/%7Cdal/19/%7Cspl/5076/%7Cgen5base/5654/%7Cwcl/5880/S"
    "%7Cgll/5175/%7CNavLib/5140/%7Cwc/5714/SL%7Cdrl/21/%7Crct/174/S%7Chrm/71/SL%7Cpdl/3/%7Cabl/4/%7Cgup/25/%7Csln/120/SL"
    "%7Cxrp/14/S%7Cpl/5276/S%7Ccwc/738/"
)
FLOWS = ["flows", "flows2", "flows3", "flows4"]


def find_file(*relative):
    """The captures (output/, flows*) are git-ignored and live in the repository root (also found from a worktree)."""
    for directory in [current_directory, *current_directory.parents]:
        if directory.joinpath(*relative).is_file():
            return directory.joinpath(*relative)
    return None


def output_page():
    path = find_file("output", OUTPUT_PAGE)
    if path is None:
        pytest.skip("the captured page output/" + OUTPUT_PAGE + " is not available")
    return path.read_text(encoding="utf-8")


def flows_pages(name):
    """(page response, the real big blob request path, Set-Cookie headers of the page response) of one capture."""
    mitmproxy_io = pytest.importorskip("mitmproxy.io")
    path = find_file(name)
    if path is None:
        pytest.skip(f"the capture {name} is not available")
    page = request_path = None
    with path.open("rb") as handle:
        for flow in mitmproxy_io.FlowReader(handle).stream():
            if flow.type != "http" or not flow.response:
                continue
            if page is None and flow.request.path == "/" and flow.request.host.startswith("www.") and flow.response.status_code == 200:
                page = flow
            if request_path is None and flow.request.path.startswith("/Api/1/Blob?") and ",brl/" in flow.request.path:
                request_path = flow.request.path
    assert page and request_path
    return page.response.get_text(), request_path, page.response.headers.get_all("set-cookie")


# a page reduced to what the code reads; the script lines are copied from the real boot script
SYNTHETIC_SCRIPT = (
    'H=GetCookieAttributeValue("aps03","lng");f.BLOB_URL=ns_weblib_util.WebsiteConfig.BLOB_LOCATION+(H||"1")+","+'
    'ns_weblib_util.WebsiteConfig.SITE_NAME+",";'
    'for(let e=0;e<t.length;++e)if("rll"===t[e].m&&!A){n=se("rll",t[e])}'
    '("y"===s.c||f.isAppRequest&&"a"==s.c||"c"==s.c)&&(i=se(s.m,s));'
    'if(ns_weblib_util.WebsiteConfig.CW)for(e of ns_weblib_util.WebsiteConfig.CW)o+=""+Y()+e.M+`/${e.V}/`,r++;'
    'function se(e,t){return 2&t.f&&(o+="S",r++),1&t.f&&(o+="L",r++)}'
)


def synthetic_page(preload, cw='[{"V":"744","M":"cwc"}]', sfbp="0", script=SYNTHETIC_SCRIPT):
    return (
        '<html><script>{"BLOB_LOCATION":"/Api/1/Blob?","SFBP":' + sfbp + ',"SITE_NAME":"www-sports","SITE_PRELOAD":' + preload +
        ',"CW":' + cw + ',"SSI":"x"}</script><script>' + script + "</script></html>"
    )


PRELOAD = (
    '[{"m":"rll","v":"25","f":8,"c":"y"},{"m":"brl","v":"24","f":11,"c":"y"},{"m":"gen5base","v":"5655","f":0,"c":"y"},'
    '{"m":"wcl","v":"5883","f":6,"c":"y"},{"m":"wc","v":"5715","f":3,"c":"c"},{"m":"appmod","v":"9","f":8,"c":"a"},'
    '{"m":"later","v":"7","f":8,"c":"n"}]'
)


class TestBuildFromSyntheticPage:
    def test_rll_and_flags_and_filter_and_cw(self):
        config = extract_config(synthetic_page(PRELOAD))
        url = build_blob_url(config, "37")
        # rll left out, S for f&2, L for f&1, "a" (app only) and "n" entries left out, cwc appended last
        assert url == "/Api/1/Blob?37,www-sports,brl/24/SL%7Cgen5base/5655/%7Cwcl/5883/S%7Cwc/5715/SL%7Ccwc/744/"

    def test_only_the_cw_version_changes_the_last_number(self):
        a = build_blob_url(extract_config(synthetic_page(PRELOAD, cw='[{"V":"738","M":"cwc"}]')), "37")
        b = build_blob_url(extract_config(synthetic_page(PRELOAD, cw='[{"V":"744","M":"cwc"}]')), "37")
        assert a.replace("cwc/738/", "cwc/744/") == b and a != b

    def test_lng_defaults_to_1_and_host_is_prepended(self):
        config = extract_config(synthetic_page(PRELOAD))
        assert build_blob_url(config, None, host="https://www.bet365.rs").startswith("https://www.bet365.rs/Api/1/Blob?1,www-sports,brl/")

    def test_entry_without_numeric_version_uses_the_manifest(self):
        config = extract_config(synthetic_page('[{"m":"brl","v":"","f":0,"c":"y"}]'))
        with pytest.raises(BlobUrlError, match="no numeric version"):
            build_blob_url(config, "37")
        manifest = {"m": {"brl": {"v": "30", "f": 11}}}
        assert build_blob_url(config, "37", manifest=manifest).endswith("www-sports,brl/30/SL%7Ccwc/744/")

    def test_single_module_mode_is_refused(self):
        with pytest.raises(BlobUrlError, match="SFBP"):
            build_blob_url(extract_config(synthetic_page(PRELOAD, sfbp="5")), "37")

    def test_missing_key_is_an_error(self):
        with pytest.raises(BlobUrlError, match="SITE_NAME not found"):
            extract_config(synthetic_page(PRELOAD).replace('"SITE_NAME"', '"X"'), check_script=False)

    def test_changed_boot_script_is_an_error(self):
        with pytest.raises(BlobUrlError, match="CW is appended"):
            extract_config(synthetic_page(PRELOAD, script=SYNTHETIC_SCRIPT.replace("e.V", "e.W")))

    def test_lng_from_cookie(self):
        assert lng_from_cookie("ct=240&lng=37") == "37"
        assert lng_from_cookie("cf=N&cg=1&cst=0&ct=240&hd=N&lng=37&oty=2&tzi=4") == "37"
        assert lng_from_cookie("ct=240") is None and lng_from_cookie(None) is None


class TestCapturedPages:
    def test_output_page(self):
        config = extract_config(output_page())
        assert config["BLOB_LOCATION"] == "/Api/1/Blob?" and config["SITE_NAME"] == "www-sports" and config["SFBP"] == 0
        assert config["CW"] == [{"V": "738", "M": "cwc"}]
        assert build_blob_url(config, "37") == OUTPUT_PAGE_URL

    @pytest.mark.parametrize("name", FLOWS)
    def test_rebuilt_url_is_the_request_the_browser_sent(self, name):
        page, request_path, _ = flows_pages(name)
        assert build_blob_url(extract_config(page), "37") == request_path


class FakeResponse(io.BytesIO):
    def __init__(self, body, status=200, headers=None):
        super().__init__(body)
        self.status, self.headers = status, headers or {}


class FakeOpener:
    """Stands in for the network: answers the page and the blob from memory and records the requests. Like the real server it
    sets the aps03 cookie (the cookie jar of the client) with the page."""

    def __init__(self, client_cookies, page, blob=b"BLOB", set_aps03="ct=240&lng=37", gzip_blob=False, blob_status=200):
        self.cookies, self.page, self.blob, self.set_aps03 = client_cookies, page, blob, set_aps03
        self.gzip_blob, self.blob_status, self.requests = gzip_blob, blob_status, []

    def open(self, request, timeout=None):
        import http.cookiejar
        self.requests.append(request)
        if request.full_url == "https://www.bet365.rs/":
            if self.set_aps03:
                self.cookies.set_cookie(http.cookiejar.Cookie(
                    0, "aps03", self.set_aps03, None, False, "www.bet365.rs", True, False, "/", True, True, None, False, None, None, {}))
            return FakeResponse(self.page.encode("utf-8"))
        if self.gzip_blob:
            return FakeResponse(gzip.compress(self.blob), self.blob_status, {"Content-Encoding": "gzip"})
        return FakeResponse(self.blob, self.blob_status)


def mocked_client(page, **options):
    client = Bet365Client(opener=object())
    client.opener = FakeOpener(client.cookies, page, **options)
    return client


class TestClientWithMockedNetwork:
    def test_run_requests_the_page_then_the_rebuilt_url(self):
        client = mocked_client(synthetic_page(PRELOAD), blob=b"the blob")
        url, body = client.run()
        assert body == b"the blob"
        assert url == "https://www.bet365.rs/Api/1/Blob?37,www-sports,brl/24/SL%7Cgen5base/5655/%7Cwcl/5883/S%7Cwc/5715/SL%7Ccwc/744/"
        page_request, blob_request = client.opener.requests
        assert page_request.full_url == "https://www.bet365.rs/" and blob_request.full_url == url
        assert blob_request.get_header("Referer") == "https://www.bet365.rs/"
        assert blob_request.get_header("User-agent") == blob_url.USER_AGENT
        assert not any(name.lower().startswith("x-net-sync") for name, _ in blob_request.header_items())

    def test_without_the_cookie_lng_is_1(self):
        url, _ = mocked_client(synthetic_page(PRELOAD), set_aps03=None).run()
        assert "/Api/1/Blob?1,www-sports," in url

    def test_gzip_body_is_decoded(self):
        _, body = mocked_client(synthetic_page(PRELOAD), blob=b"x" * 1000, gzip_blob=True).run()
        assert body == b"x" * 1000

    def test_error_status_raises(self):
        with pytest.raises(BlobUrlError, match="answered 403"):
            mocked_client(synthetic_page(PRELOAD), blob_status=403).run()

    @pytest.mark.parametrize("name", FLOWS)
    def test_run_on_a_captured_page_requests_exactly_what_the_browser_requested(self, name):
        page, request_path, set_cookies = flows_pages(name)
        aps03 = next(c.split(";")[0].split("=", 1)[1] for c in set_cookies if c.startswith("aps03="))
        client = mocked_client(page, set_aps03=aps03)
        url, _ = client.run()
        assert url == "https://www.bet365.rs" + request_path
        assert client.opener.requests[1].full_url == url
