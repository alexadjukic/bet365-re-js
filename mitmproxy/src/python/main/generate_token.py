#!/usr/bin/env python3
"""Pure-Python re-implementation of `X-Net-Sync-Term` token *generation*
(the JavaScript original: `mitmproxy/src/javascript/cli/generate-token.js` and the
`token-verifier/{token-generator,token-encoder,token-verifier,field-rules}.js` modules it uses).

    venv/bin/python mitmproxy/src/python/main/generate_token.py <input.json> [--json]

Nothing is sent anywhere; this only computes header values offline, byte for byte identical to the
JS generator (checked against `input.json` in the repo root and `mitmproxy/src/javascript/cli/generate-token.js
input.json --no-check`, which agree on all 50 tokens as of this port).

Scope: this file ports *generation only* -- the algorithm that turns known inputs into a token. It
deliberately leaves out two things the JS CLI also offers, which are different concerns:
  * `--template`, which reads a mitmproxy capture and derives an input file from *already-issued* real
    tokens (`token-verifier/capture-inputs.js`) -- that is extraction, already covered on the Python side
    by `extract-session.py`.
  * `--no-check` self-verification (decoding every generated token and re-running the field rules) --
    that is the *verifier*, a separate read path (`token-verifier/token-verifier.js`,
    `token-verifier/field-rules.js::checkFieldRules`) over the same wire format, not part of building one.

## Where each input comes from

Every field below was classified in `data/notes/generate-token-parameters.md` and
`data/notes/generate-token-browser-fingerprints.md` (built from the four real captures in
`data/captures/{session,session2,session3,session4}.json`) into one of:

  1. **From a request.** A comment next to the field says exactly which request/response/cookie carries it.
  2. **Not from a request, and constant across all four captures.** The value is baked in as a module-level
     constant below (not a parameter at all), with a comment saying why it is safe to fix.
  3. **From a request, but the value differs across the four captures.** A comment lists the four values we
     actually saw, and the field stays a required input (there is no single correct constant).
  4. Two kinds of field fit none of the three: `headerByte` is not response data at all (it is a literal
     baked into the served `received-32.js` bundle) and `canvasA`/`canvasB`/`persistentId` are not from a
     request either but still change every page load (or between captures). These stay required inputs too,
     with a comment explaining why they cannot be hardcoded or read off the wire.
"""
from __future__ import annotations

import argparse
import base64
import dataclasses
import json
import random
import sys
import time
from typing import Optional

from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

# --------------------------------------------------------------------------------------------------------
# 1. Low-level primitives: FNV-1a, the custom 32-bit hash used for the checksum, and AES-128-CTR.
#    Ported line for line from token-verifier.js so the bit-level behaviour (32-bit wraparound, the
#    counter's byte-15-into-byte-14 carry) matches exactly.
# --------------------------------------------------------------------------------------------------------

# hard-coded in the served script (fn_28359 aesSetupHardcodedKey); the token's only "secret" is this
# constant, which anyone holding the script already has -- see data/notes/x-net-sync-term.md section 5.5
AES_KEY = bytes([45, 67, 89, 12, 34, 56, 78, 90, 123, 234, 45, 67, 89, 12, 34, 56])

# 64-entry table of the custom checksum (fn_67765), stored XOR 127 in the VM program; copied from
# token-verifier.js HASH_TABLE
HASH_TABLE = [
    1101195530, 1849170683, 1011462487, 1870552039, 2116561607, 1297822139, 495394314, 684556403,
    1902634096, 37428903, 787769321, 1225145233, 40194939, 1093801093, 999607972, 1161745344,
    413066433, 145937900, 1380633445, 337691791, 33891280, 1765845096, 371305101, 1107842788,
    479406669, 1546817993, 1707920019, 461467316, 1760470079, 1921015082, 1040396305, 2062460101,
    528997059, 1754614127, 983305111, 1638855828, 1568835819, 1912562212, 1009689012, 2081581189,
    582619912, 569959051, 1235713677, 1325374686, 978421303, 1698986017, 1291274576, 1359696440,
    1420307973, 1797254114, 1378187939, 645736366, 1209500432, 644363566, 103032208, 416000089,
    1509682968, 566378580, 1686909334, 1593637567, 787797531, 1638172379, 1253768911, 567606730,
]

_MASK32 = 0xFFFFFFFF


def fnv1a32(text: str) -> int:
    """Standard 32-bit FNV-1a over the low byte of each character (fn_26374)."""
    h = 0x811C9DC5
    for ch in text:
        h = ((h ^ (ord(ch) & 0xFF)) * 16777619) & _MASK32
    return h


def _mix8(h: int, i: int) -> int:
    for j in range(8):
        t = HASH_TABLE[(i + j) % 64]
        low = ((h & 0xFFFF) * ((h ^ t) & 0xFFFF)) & 0xFFFF
        high = (((h >> 16) & 0xFFFF) * (((h ^ t) >> 16) & 0xFFFF)) & 0xFFFF
        h = (h + (low << 16) + high) & _MASK32
        h ^= h >> ((h & 15) + 1)
    return h & _MASK32


def _mix4(h: int) -> int:
    for i in range(4):
        h = (((h << 1) | (h >> 31)) & _MASK32) ^ HASH_TABLE[i]
        h = _mix8(h, i)
    return h & _MASK32


def hash32(text: str) -> int:
    """The VM's custom 32-bit hash (fn_68005 / fn_67938 / fn_67772), used only for the checksum `p`."""
    h = 0
    for ch in text:
        code = ord(ch)
        if code <= 256:
            h ^= code
        h = _mix4(h)
    return h & _MASK32


def _aes128_ecb_block(block16: bytes) -> bytes:
    encryptor = Cipher(algorithms.AES128(AES_KEY), modes.ECB()).encryptor()
    return encryptor.update(block16) + encryptor.finalize()


def aes_ctr(data: bytes, iv: bytes, carry: bool = True) -> bytes:
    """AES-128 counter mode where the whole 16-byte block is one big-endian counter (fn_29855); the carry
    from byte 15 into byte 14 etc. is required -- 5 of 31 real tokens in the first capture only decrypt
    with it (data/notes/x-net-sync-term.md section 5.5)."""
    out = bytearray(len(data))
    counter = bytearray(iv)
    for i in range(0, len(data), 16):
        keystream = _aes128_ecb_block(bytes(counter))
        block_len = min(16, len(data) - i)
        for j in range(block_len):
            out[i + j] = data[i + j] ^ keystream[j]
        if carry:
            k = 15
            while k >= 0:
                counter[k] = (counter[k] + 1) & 0xFF
                if counter[k] != 0:
                    break
                k -= 1
        else:
            counter[15] = (counter[15] + 1) & 0xFF
    return bytes(out)


def _iv_word(now: int, i: int, nonce: int) -> int:
    unsigned = fnv1a32(f"0{now}{i}{nonce}")
    signed = unsigned - 0x1_0000_0000 if unsigned >= 0x8000_0000 else unsigned
    return abs(signed)


def iv_for(now: int, nonce: int) -> bytes:
    """makeIv16 (fn_29639): 4 words of abs(int32(fnv1a32("0"+now+i+nonce))), big-endian."""
    return b"".join(_iv_word(now, i, nonce).to_bytes(4, "big") for i in range(4))


def checksum_for(fields: dict) -> int:
    """p = hash32(b + r + q + z + b + d + v) -- binds the flag words to the nonce, time and boot state
    (data/notes/x-net-sync-term.md section 5.8)."""
    text = f"{fields['b']}{fields['r']}{fields['q']}{fields['z']}{fields['b']}{fields['d']}{fields['v']}"
    return hash32(text)


# --------------------------------------------------------------------------------------------------------
# 2. TLV record encoding (token-encoder.js): [1B key length][key][2B LE value length][value].
# --------------------------------------------------------------------------------------------------------

DEFAULT_HEADER = bytes([0x03, 0x48, 0x00, 0x04])

# outer-record keys whose value is a little-endian integer instead of a string (token-verifier.js INT_KEYS)
INT_KEYS = {"b", "d", "p", "q", "r", "v", "w", "aa"}

# keys of the nested block `f` that hold integers (token-encoder.js NESTED_INT_KEYS)
NESTED_INT_KEYS = {
    "i_u", "i_r", "i_tf", "i_bt", "i_cl", "i_ps", "i_z", "i_au", "i_pl",
    "i_ca", "i_cb", "i_cr", "i_df", "i_sw", "i_sh", "i_hc", "i_vr", "i_hp", "i_kl", "i_ws",
}


def minimal_width(value: int) -> int:
    """Width chosen by the VM (tlvInt): 1 byte below 2^8, 2 below 2^16, 4 up to 2^31-1, else 8 (checked
    against real tokens: a checksum below 2^31 takes 4 bytes, one above takes 8)."""
    if value < 0:
        raise ValueError("negative integers are not used in tokens")
    if value < (1 << 8):
        return 1
    if value < (1 << 16):
        return 2
    if value < (1 << 31):
        return 4
    return 8


def encode_int(value: int, width: Optional[int] = None) -> bytes:
    if width is None:
        width = minimal_width(value)
    return value.to_bytes(width, "little")


def encode_record(key: str, value_bytes: bytes) -> bytes:
    key_bytes = key.encode("latin1")
    return bytes([len(key_bytes)]) + key_bytes + len(value_bytes).to_bytes(2, "little") + value_bytes


def encode_records(entries: list[tuple[str, object]], int_keys: set[str] = INT_KEYS) -> bytes:
    out = bytearray()
    for key, value in entries:
        if isinstance(value, (bytes, bytearray)):
            value_bytes = bytes(value)
        elif key in int_keys or isinstance(value, int):
            value_bytes = encode_int(int(value))
        else:
            value_bytes = str(value).encode("latin1")
        out += encode_record(key, value_bytes)
    return bytes(out)


def encode_nested(entries: list[tuple[str, object]]) -> bytes:
    return encode_records(entries, int_keys=NESTED_INT_KEYS)


def assemble_token(header: bytes, sst: bytes, iv: bytes, plaintext: bytes) -> str:
    length = bytes([len(sst) >> 8, len(sst) & 0xFF])
    return base64.b64encode(header + length + sst + iv + aes_ctr(plaintext, iv)).decode("ascii")


def build_token(entries: list[tuple[str, object]], sst: bytes, iv_time: Optional[int] = None,
                 header: bytes = DEFAULT_HEADER) -> str:
    """Builds one token from the ordered outer-record entries. `sst` is WITHOUT its 2-byte length prefix
    (assemble_token derives the length from len(sst) itself, like token-encoder.js's buildToken)."""
    fields = dict(entries)
    fields["p"] = checksum_for(fields)
    encoded = []
    for key, value in entries:
        if key == "p":
            value = fields["p"]
        elif key == "f":
            value = encode_nested(value)
        encoded.append((key, value))
    iv = iv_for(iv_time if iv_time is not None else int(fields["d"]) + 1000, fields["b"])
    return assemble_token(header, sst, iv, encode_records(encoded))


# --------------------------------------------------------------------------------------------------------
# 3. Field rules (field-rules.js): everything the generator computes rather than takes as an input.
# --------------------------------------------------------------------------------------------------------

NO_ACTIVITY = 1111  # f.i_au before the first Loader.load call was seen by the hook (r63 undefined)

# f.i_r does not advance for URLs containing one of these (fn_44705, checked on the lower-cased URL)
UNCOUNTED_URL_PARTS = ["betbuilder", "searchapi", "streamingapi", "streamingmonitor", "/sports-assets/"]


def is_counted_url(url: str) -> bool:
    lower = url.lower()
    return not any(part in lower for part in UNCOUNTED_URL_PARTS)


def activity_age(now: int, last_load: Optional[int]) -> int:
    """f.i_au: whole seconds since the last Loader.load call recorded by the hook, or 1111 if none yet."""
    return NO_ACTIVITY if last_load is None else (now - last_load) // 1000


def flag_c(i_au: int) -> int:
    """aa (flag word C): bit 0 set when f.i_au is neither 0 nor 1111; reset to 0 for every token."""
    return 1 if i_au not in (0, NO_ACTIVITY) else 0


def page_age(now: int, start: int) -> int:
    """f.i_pl: whole seconds since the script started."""
    return (now - start) // 1000


def clock_skew(server_time: int, start: int) -> int:
    """Added to Date.now() to get `d`: 1000 * (SERVER_TIME - whole seconds of the script start time)."""
    return 1000 * (server_time - start // 1000)


def i_ws(start: int) -> int:
    """f.i_ws: a 3-day bucket of the script start time, scrambled into one byte; constant per page load."""
    x = int(start // 259200000) & _MASK32
    part = ((x << 5) | (x >> 27)) & 0xFFFF
    return (part ^ (x >> 3) ^ 40503) & 0xFF


def i_df(cc: str, ca: int, cb: int, width: int, height: int, cores: int) -> int:
    """f.i_df: FNV-1a of cc + i_ca + i_cb + width + "x" + height + hardwareConcurrency (decimal text)."""
    return fnv1a32(f"{cc}{ca}{cb}{width}x{height}{cores}")


def pub_value(subscribe: str = "", unsubscribe: str = "") -> Optional[str]:
    """f.pub (build 16520+, websocket tokens only): the pending subscribe/unsubscribe topic lists."""
    if subscribe == "" and unsubscribe == "":
        return None
    if subscribe == "":
        return f"u{unsubscribe}"
    return f"s{subscribe}" if unsubscribe == "" else f"s{subscribe}|u{unsubscribe}"


# --------------------------------------------------------------------------------------------------------
# 4. Session inputs.
#
#    Category-2 fields (not from a request, constant across all four captures in data/captures/) are
#    hardcoded module constants below, NOT parameters: they are used directly by TokenGenerator and are not
#    part of the Session/BrowserProfile dataclasses at all. Category 1/3/4 fields stay as required or
#    defaulted dataclass fields, each commented with its provenance.
# --------------------------------------------------------------------------------------------------------

# --- category 2: not from a request, identical in all four captures (session.json/2/3/4) -> hardcoded ---

# z: IANA time zone (Intl.DateTimeFormat().resolvedOptions().timeZone). Client OS/browser setting, never
# sent by the server; identical in all four captures because all four came from the same Linux/Firefox
# profile ("Europe/Belgrade"). A different machine/OS would need a different value.
TIMEZONE = "Europe/Belgrade"

# t: Date().getTimezoneOffset() as text. Same client-only setting as TIMEZONE, and constant for the
# same reason (tied 1:1 to TIMEZONE for this profile).
TIMEZONE_OFFSET = "-120"

# v / f.i_z: "1 when the site looks fully booted, else 2". A client runtime flag computed by the page's
# own boot sequence, never present in any request; all four captures show 2 (the "fully booted" state
# was never observed in these captures).
BOOT_STATE = 2

# f.cc: SHA-256 of the 38 CSS system colours' computed background-color (depends on OS/theme, not on the
# page load). Identical across all four captures (same OS/theme every time).
BROWSER_CC = "3e48088c12112d3c5cff2326804e2725e0935afe81495001a1f67a1d92095988"

# f.i_sw / f.i_sh: screen width/height (the `screen` object). Client hardware, not sent in any request;
# identical (1920x1080) in all four captures.
BROWSER_WIDTH = 1920
BROWSER_HEIGHT = 1080

# f.i_hc: navigator.hardwareConcurrency (CPU count). Client hardware, not sent in any request; 12 in all
# four captures.
BROWSER_CORES = 12

# f.i_u: number of entries in localStorage["cf4"] (hashed usernames seen in this browser, see
# data/notes/chunk-explanations.md "cf3/cf4" section). Not sent in any request; 1 in all four captures
# (each was a fresh/first-use profile while logged out, so cf4 holds exactly the hash of "").
BROWSER_KNOWN_USERS = 1

# f.uqid / outer `x`: the usdi/uqid cookie attribute. Not read off the wire in any of the four captures
# (all empty); kept as a constant rather than a request-derived field because we never observed a
# non-empty value to know which request would carry it.
BROWSER_UQID = ""

# f.il: logged-in state. Not from a request; "false" in all four captures (all four sessions are logged out).
BROWSER_LOGGED_IN = "false"

# f.rf: document.referrer. Not from a request; empty in all four captures (direct navigation each time).
BROWSER_REFERRER = ""

# f.i_cr: whether two toDataURL() calls of the same canvas differ. Not from a request; false in all four
# captures (this profile/browser does not randomise canvas output).
BROWSER_CANVAS_RANDOMISED = False


@dataclasses.dataclass
class BrowserProfile:
    """Only the browser-fingerprint fields that are NOT constant across the four captures. See the
    BROWSER_* module constants above for the ones that are."""

    # f.i_ca: fnv1a32 of toDataURL() of canvas "b3-FP-v1-alpha". Not from a request -- computed by drawing
    # to an off-screen <canvas> and hashing the pixels. Changes on every single page load, even on the same
    # machine (the canvas is redrawn each time): 3345146812 / 293519227 / 3373118407 / 3574360371 across the
    # four captures. Required input; there is no constant that would be correct twice.
    canvas_a: int

    # f.i_cb: same as canvas_a for canvas "x9-FP-v1-bravo". Observed: 1061486175 / 356784394 / 2290748187 /
    # 1305652757 across the four captures. Required input, same reasoning as canvas_a.
    canvas_b: int

    # f.i_ps: localStorage["cf3"], a persistent random 31-bit id created with Math.random() the first time
    # it is missing and then written back (see data/notes/chunk-explanations.md, fn_36223). Not from a
    # request. In principle it should be stable per browser profile, but it differed in all four captures
    # (746858627 / 2110294453 / 2046274799 / 440059885) -- evidence that localStorage was not shared between
    # them (cleared, private mode, or four separate profiles). Required input, no safe default.
    persistent_id: int


@dataclasses.dataclass
class Session:
    """Fixed-per-page-load inputs (SESSION_INPUTS in token-generator.js). Fields not listed here are the
    hardcoded module constants above (BOOT_STATE, TIMEZONE, TIMEZONE_OFFSET, BROWSER_*)."""

    # byte 1 of the token header. NOT response data: it is a literal constant inside the served
    # received-32.js bundle (fn_30165 buildToken: chr(3)+chr(72) or chr(73)), only readable by reading that
    # script's code (or decoding one already-captured real token). It tracks the build/site version loosely
    # (72 for site version 16504, 73 for 16520 *and* 16528 in our captures) but is a separate counter, not
    # equal to SITE_VERSION. Defaults to 73 (the newest build we captured); override for older builds.
    header_byte: int = 73

    # atob(WebsiteConfig.SST) of the CONFIG response, WITHOUT its own 2-byte length prefix.
    # From a request: GET /defaultapi/sports-configuration... response body,
    # ns_weblib_util.WebsiteConfig.SST (this overwrites the page's bootstrap SST -- tokens always carry the
    # config SST, never the page one; data/notes/x-net-sync-term.md section 5.3).
    # Varies every capture (opaque per-page-load server blob, 137-byte payload each time): the four captures'
    # SST payloads share no meaningful structure (entropy ~6.6-6.8 bits/byte, effectively random). No default.
    sst: bytes = b""

    # WebsiteConfig.SERVER_TIME (seconds).
    # From a request: the initial page load, GET / (host starting "www."), regex "SERVER_TIME":(\d+) on the
    # HTML (mitmproxy/src/python/main/extract-session.py line 43).
    # Varies every capture (it is a live timestamp): 1790179485 / 1790429972 / 1790435271 / 1790604406.
    server_time: int = 0

    # _websiteManifest.v (f.mv).
    # From a request: the "?v=<n>" query parameter of the "getmanifest" request
    # (extract-session.py line 58-59); confirmed equal to the token's own f.mv in all four captures.
    # Varies every capture (site build number): "16504" / "16520" / "16520" / "16528".
    manifest_version: str = "16528"

    # s: the pstk cookie (session id).
    # From a request: Set-Cookie: pstk=... on the CONFIG response (extract-session.py line 56,
    # field config_set_cookie); sent back as a Cookie header on later requests.
    # Varies every capture (a fresh session id is minted per page load): "4A1066EAD9EC4051BA3A94FCC2481B0F000003"
    # / "E2E27C7E536C431FB11B71ACFAF3C724000003" / "E9BA6A681C5B44EFB40D74AE90F96C84000003" /
    # "93823669E1022E1E96280EF5F646D127000003". None means the field is omitted, as when no cookie exists yet.
    session_id: Optional[str] = None

    # j: flashvars.CURRENCY_EXCHANGE_RATE.
    # From a request (per data/notes/x-net-sync-term.md section 5.7): the initial page HTML's flashvars,
    # the same response that carries SERVER_TIME.
    # Varies every capture (a live FX rate): "136.39" / "136.494" / "136.494" / "136.434".
    currency_rate: Optional[str] = None

    # o: Locator.user.countryId.
    # From a request: the "ct=" value of the "aps03" cookie, sent both as the Cookie request header and
    # returned in Set-Cookie on the config request/response (config_request_cookie / config_set_cookie).
    # Constant across all four captures ("240" every time, same jurisdiction/profile), so a default is given.
    country_id: Optional[str] = "240"

    # e: navigator.userAgent.
    # From a request: the User-Agent header the browser itself sends on every request
    # (extract-session.py reads it off the first request that has one).
    # Constant across all four captures (same machine/profile), so a default is given.
    user_agent: str = "Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0"

    # k: location.host.
    # From a request: the host portion of any request URL in the flow.
    # Constant across all four captures ("www.bet365.rs" every time), so a default is given.
    host: str = "www.bet365.rs"

    # n: Locator.user.username.
    # From a request in principle (an authenticated session/account API response) -- but absent in all
    # four captures, because all four sessions are logged out, so the field was never observed and never
    # sent by any request. None means the field is omitted, exactly as in all four captures.
    username: Optional[str] = None

    # b: the random 31-bit nonce of the page load. NOT from a request -- Math.random() output, fixed once
    # per page load. Differs in all four captures (1746452776 / 1885429314 / 614936223 / 617784986), as it
    # must: it is freshly rolled every page load, not read off the wire. load_session rolls it with
    # new_nonce() once per loaded session; it is not read from the session JSON.
    nonce: int = 0

    # Date.now() when the script started (ms). NOT from a request -- the client's own clock at script start;
    # no capture records it directly (capture-inputs.js instead infers a compatible window from a
    # session's own f.i_pl/d/f.i_au). Observed script-start times of the four captures: 1790179486373 /
    # 1790429973205 / 1790435271558 / 1790604406439. Required input, no default.
    start: int = 0

    browser: BrowserProfile = dataclasses.field(default_factory=lambda: BrowserProfile(canvas_a=0, canvas_b=0, persistent_id=0))


# --------------------------------------------------------------------------------------------------------
# 5. Per-request inputs (REQUEST_INPUTS in token-generator.js). These are the request itself (or a
#    client-side behavioural observation tied to it), not a separate session-level parameter -- see
#    data/notes/generate-token-parameters.md section 3 for the full provenance discussion.
# --------------------------------------------------------------------------------------------------------


@dataclasses.dataclass
class Request:
    kind: str                          # "http" (a Loader request) or "ws" (websocket handshake/subscribe/unsubscribe)
    url: str                           # ns_gen5_net.url: path and query of the request (websocket: /zap/?uid=...)
    now: int                           # Date.now() at token time (ms) -- IS the request's own timestamp
    body: Optional[str] = None         # request body, if any (`w` is fnv1a32 of it)
    hash: str = ""                     # location.hash (`c`) at request time
    connection_id: str = ""            # window.ns_datalib_readit.conId (`g`); empty for HTTP
    stack_class: Optional[str] = None  # "I"/"J"/"K" from the call stack (`h`) -- client runtime, not from a request
    ips: Optional[str] = None          # WebRTC srflx IPs found so far, comma-joined (`i`) -- client-side STUN probe result
    scripts: Optional[str] = None      # cumulative new <script> sources, " ~ "-joined (`f.p`) -- DOM observation
    iframes: Optional[str] = None      # same for iframes (`f.q`) -- DOM observation
    clicks: Optional[int] = None       # click counter (`f.i_cl`) -- client-side click hook
    pending: Optional[dict] = None     # {subscribe, unsubscribe} topic lists pending for this ws message (build 16520+, `f.pub`)
    load_time: Optional[int] = None    # time of the Loader.load call for an HTTP token (ms, default: now)
    flags: Optional[dict] = None       # {r, q}: the detector flag words (0 for an unmodified browser) -- client-side checks


# --------------------------------------------------------------------------------------------------------
# 6. The generator itself -- a straight port of TokenGenerator in token-generator.js.
# --------------------------------------------------------------------------------------------------------


class TokenGenerator:
    def __init__(self, session: Session):
        self.session = session
        self.tokens = 0
        self.counter = 0
        self.last_load: Optional[int] = None

    def next(self, request: Request) -> str:
        session = self.session
        browser = session.browser
        now = request.now
        first = self.tokens == 0
        self.tokens += 1

        # f.i_r counts tokens except for some URLs (fn_44705); the Loader.load hook is installed by the
        # first token and records the time of every later HTTP load (fn_68509), which f.i_au measures
        if is_counted_url(request.url):
            self.counter += 1
        if request.kind == "http" and not first:
            self.last_load = request.load_time if request.load_time is not None else now
        idle = activity_age(now, self.last_load)

        pub = None
        if session.header_byte >= 73 and request.url.startswith("/zap/") and request.pending:
            pub = pub_value(request.pending.get("subscribe", ""), request.pending.get("unsubscribe", ""))

        nested: list[tuple[str, object]] = [("i_u", BROWSER_KNOWN_USERS)]
        if request.scripts:
            nested.append(("p", request.scripts))
        if request.iframes:
            nested.append(("q", request.iframes))
        nested += [
            ("i_r", self.counter),
            ("i_tf", 0), ("i_bt", 0),
        ]
        if request.clicks is not None:
            nested.append(("i_cl", request.clicks))
        nested += [
            ("i_ps", browser.persistent_id),
            ("uqid", BROWSER_UQID), ("uv", ""), ("ur", ""),
            ("ua", session.user_agent),
            ("il", BROWSER_LOGGED_IN),
            ("ul", request.url),
            ("rf", BROWSER_REFERRER),
            ("d", session.host),
            ("x", "s"),
            ("i_z", BOOT_STATE),
            ("i_au", idle), ("i_pl", page_age(now, session.start)),
            ("mv", session.manifest_version),
            ("cc", BROWSER_CC),
            ("i_ca", browser.canvas_a), ("i_cb", browser.canvas_b),
            ("i_cr", 1 if BROWSER_CANVAS_RANDOMISED else 0),
            ("i_df", i_df(BROWSER_CC, browser.canvas_a, browser.canvas_b, BROWSER_WIDTH, BROWSER_HEIGHT, BROWSER_CORES)),
            ("i_sw", BROWSER_WIDTH), ("i_sh", BROWSER_HEIGHT), ("i_hc", BROWSER_CORES),
            ("i_vr", 157), ("i_hp", 66), ("i_kl", 231),  # literals of this build (x-net-sync-term.md 5.7)
            ("i_ws", i_ws(session.start)),
        ]
        if pub is not None:
            nested.append(("pub", pub))

        flags = request.flags or {}
        entries: list[tuple[str, object]] = [
            ("a", "1"),
            ("b", session.nonce),
            ("c", request.hash or ""),
            ("d", now + clock_skew(session.server_time, session.start)),
            ("e", session.user_agent),
            ("p", 0),  # recomputed by build_token
            ("g", request.connection_id or ""),
        ]
        if request.stack_class:
            entries.append(("h", request.stack_class))
        if request.ips:
            entries.append(("i", request.ips))
        if session.currency_rate:
            entries.append(("j", session.currency_rate))
        entries.append(("k", session.host))
        if session.username:
            entries.append(("n", session.username))
        if session.country_id:
            entries.append(("o", session.country_id))
        entries += [
            ("q", flags.get("q", 0)),
            ("r", flags.get("r", 0)),
        ]
        if session.session_id:
            entries.append(("s", session.session_id))
        entries.append(("t", TIMEZONE_OFFSET))
        entries.append(("u", request.url))
        entries.append(("v", BOOT_STATE))
        if request.body:
            entries.append(("w", fnv1a32(request.body)))
        entries += [
            ("x", BROWSER_UQID),
            ("z", TIMEZONE),
            ("ab", "s"),
            ("f", nested),
            ("aa", flag_c(idle)),
        ]

        header = bytes([0x03, session.header_byte, 0x00, 0x04])
        return build_token(entries, sst=session.sst, iv_time=now, header=header)


# --------------------------------------------------------------------------------------------------------
# 6b. Function API: one token from plain arguments. No input file, no load_session/load_request; the only
#     things not passed in are the hardcoded module constants (BOOT_STATE, TIMEZONE, BROWSER_*, ...).
# --------------------------------------------------------------------------------------------------------


def generate_token(
    *,
    # --- session (fixed for a page load) ---
    sst: bytes,
    server_time: int,
    start: int,
    canvas_a: int,
    canvas_b: int,
    persistent_id: int,
    session_id: Optional[str] = None,
    currency_rate: Optional[str] = None,
    nonce: Optional[int] = None,
    header_byte: int = 73,
    manifest_version: str = "16528",
    country_id: Optional[str] = "240",
    user_agent: str = "Mozilla/5.0 (X11; Linux x86_64; rv:156.0) Gecko/20100101 Firefox/156.0",
    host: str = "www.bet365.rs",
    username: Optional[str] = None,
    # --- request ---
    url: str,
    now: Optional[int] = None,
    kind: str = "http",
    body: Optional[str] = None,
    hash: str = "",
    connection_id: str = "",
    stack_class: Optional[str] = None,
    ips: Optional[str] = None,
    scripts: Optional[str] = None,
    iframes: Optional[str] = None,
    clicks: Optional[int] = None,
    pending: Optional[dict] = None,
    load_time: Optional[int] = None,
    flags: Optional[dict] = None,
    # --- generator state carried over from earlier tokens of the same page load ---
    prior_tokens: int = 0,
    counter: int = 0,
    last_load: Optional[int] = None,
) -> str:
    """Build one X-Net-Sync-Term token from explicit arguments and return it as a string.

    Nothing is read from a file: no load_session/load_request, no input.json. Everything the token
    depends on is passed in, except the hardcoded module constants (BOOT_STATE, TIMEZONE,
    TIMEZONE_OFFSET, BROWSER_*), which are not arguments.

    Session arguments (fixed for a page load):
      sst            REQUIRED. atob(WebsiteConfig.SST) as bytes, WITHOUT its 2-byte length prefix. The
                     file loader strips that prefix; here you pass the decoded bytes directly.
      server_time    REQUIRED. WebsiteConfig.SERVER_TIME, in seconds.
      start          REQUIRED. Date.now() when the script started, in ms.
      canvas_a       REQUIRED. f.i_ca, fingerprint of canvas "b3-FP-v1-alpha".
      canvas_b       REQUIRED. f.i_cb, fingerprint of canvas "x9-FP-v1-bravo".
      persistent_id  REQUIRED. f.i_ps, localStorage["cf3"] (random 31-bit id).
      session_id     the pstk cookie (`s`); None omits the field.
      currency_rate  flashvars.CURRENCY_EXCHANGE_RATE (`j`); None omits the field.
      nonce          the page-load nonce (`b`), also used in the IV and the checksum. If omitted, a fresh
                     random one is generated (new_nonce()). The real page uses ONE nonce for every token
                     of a page load, so when generating several tokens for one session, call new_nonce()
                     once and pass that same value to every call; otherwise each token gets a different
                     `b`.
      username       Locator.user.username (`n`); None omits the field (logged out).
      header_byte, manifest_version, country_id, user_agent, host
                     optional, defaulting to the values of the captured build/profile (73, "16528",
                     "240", the Firefox 156 Linux UA, "www.bet365.rs").

    Request arguments:
      url            REQUIRED. Path and query of the request (websocket: /zap/?uid=...).
      now            Date.now() of the request in ms. Default: the current time, never before `start`.
      kind           "http" (a Loader request, the default) or "ws".
      body           request body, if any (`w` is its fnv1a32).
      hash           location.hash (`c`).
      connection_id  ns_datalib_readit.conId (`g`); empty for HTTP.
      stack_class    "I"/"J"/"K" (`h`).
      ips            comma-joined WebRTC srflx IPs (`i`).
      scripts, iframes, clicks   f.p, f.q and f.i_cl (DOM/click observations).
      pending        {subscribe, unsubscribe} topic lists for a ws message (build 16520+, f.pub).
      load_time      time of the Loader.load call for an HTTP token, in ms (default: now).
      flags          {r, q} detector flag words (0 for an unmodified browser).

    State carried over from earlier tokens of the same page load. The token depends on earlier tokens
    only through these three values, which default to those of a first token. Leave them alone for a
    single, first token; for a later token pass the values the earlier ones left behind. The function
    does not return them, so the caller has to track them:
      prior_tokens   how many tokens were generated before this one.
      counter        the f.i_r counter after those tokens.
      last_load      time of the last HTTP load in ms; None means none yet (f.i_au is then 1111).

    Returns the base64 token, the value of the X-Net-Sync-Term header.
    """
    session = Session(
        header_byte=header_byte, sst=sst, server_time=server_time, manifest_version=manifest_version,
        session_id=session_id, currency_rate=currency_rate, country_id=country_id, user_agent=user_agent,
        host=host, username=username, nonce=new_nonce() if nonce is None else nonce, start=start,
        browser=BrowserProfile(canvas_a=canvas_a, canvas_b=canvas_b, persistent_id=persistent_id),
    )
    request = Request(
        kind=kind, url=url, now=int(max(time.time() * 1000, start)) if now is None else now, body=body,
        hash=hash, connection_id=connection_id, stack_class=stack_class, ips=ips, scripts=scripts,
        iframes=iframes, clicks=clicks, pending=pending, load_time=load_time, flags=flags,
    )
    generator = TokenGenerator(session)
    generator.tokens, generator.counter, generator.last_load = prior_tokens, counter, last_load
    return generator.next(request)


# --------------------------------------------------------------------------------------------------------
# 7. Loading an input.json (same shape as the JS CLI's input file) into Session/[Request, ...].
#    Category-2 fields present in the JSON are checked against the hardcoded constant rather than used, so
#    the same fixtures used to test the JS generator (e.g. the repo's input.json) can be replayed here too.
# --------------------------------------------------------------------------------------------------------

_HARDCODED_BROWSER_FIELDS = {
    "cc": BROWSER_CC, "width": BROWSER_WIDTH, "height": BROWSER_HEIGHT, "cores": BROWSER_CORES,
    "knownUsers": BROWSER_KNOWN_USERS, "uqid": BROWSER_UQID, "loggedIn": BROWSER_LOGGED_IN,
    "referrer": BROWSER_REFERRER, "canvasRandomised": BROWSER_CANVAS_RANDOMISED,
}
_HARDCODED_SESSION_FIELDS = {"timezone": TIMEZONE, "timezoneOffset": TIMEZONE_OFFSET, "bootState": BOOT_STATE}


def _check_hardcoded(container: dict, hardcoded: dict, where: str) -> None:
    for key, expected in hardcoded.items():
        if key in container and container[key] != expected:
            raise ValueError(
                f"{where}.{key} = {container[key]!r} does not match the hardcoded constant {expected!r}; "
                "this script assumes the browser profile documented in "
                "data/notes/generate-token-browser-fingerprints.md -- edit the module constant if you are "
                "replaying a different profile"
            )


def new_nonce() -> int:
    """The page-load nonce, rolled like the page does: floor(Math.random() * 2147483647), a 31-bit value."""
    return int(random.SystemRandom().random() * 2147483647)


def load_session(raw: dict) -> Session:
    _check_hardcoded(raw, _HARDCODED_SESSION_FIELDS, "session")
    browser_raw = raw.get("browser", {})
    _check_hardcoded(browser_raw, _HARDCODED_BROWSER_FIELDS, "session.browser")
    browser = BrowserProfile(
        canvas_a=browser_raw["canvasA"],
        canvas_b=browser_raw["canvasB"],
        persistent_id=browser_raw["persistentId"],
    )
    sst_raw = raw["sst"]
    sst = base64.b64decode(sst_raw) if isinstance(sst_raw, str) else bytes(sst_raw)
    if len(sst) < 3 or int.from_bytes(sst[:2], "big") != len(sst) - 2:
        raise ValueError("session.sst must be the base64 of atob(WebsiteConfig.SST), self-length-prefixed")
    server_time = raw["serverTime"]
    server_time = int(time.time()) if server_time == "now" else int(server_time)
    start = raw["start"]
    start = int(time.time() * 1000) if start == "now" else int(start)
    return Session(
        header_byte=int(raw["headerByte"]),
        sst=sst[2:],  # build_token/assemble_token re-derive the 2-byte length from len(sst)
        server_time=server_time,
        manifest_version=str(raw["manifestVersion"]),
        session_id=raw.get("sessionId"),
        currency_rate=raw.get("currencyRate"),
        country_id=raw.get("countryId"),
        user_agent=raw["userAgent"],
        host=raw["host"],
        username=raw.get("username"),
        nonce=new_nonce(),
        start=start,
        browser=browser,
    )


def load_request(raw: dict, session: Session) -> Request:
    now = raw.get("now")
    now = int(now) if now is not None else int(max(time.time() * 1000, session.start))
    return Request(
        kind=raw["kind"],
        url=raw["url"],
        now=now,
        body=raw.get("body"),
        hash=raw.get("hash", ""),
        connection_id=raw.get("connectionId", ""),
        stack_class=raw.get("stackClass"),
        ips=raw.get("ips"),
        scripts=raw.get("scripts"),
        iframes=raw.get("iframes"),
        clicks=raw.get("clicks"),
        pending=raw.get("pending"),
        load_time=raw.get("loadTime"),
        flags=raw.get("flags"),
    )


def load_input(path: str) -> tuple[Session, list[Request]]:
    with open(path, encoding="utf-8") as handle:
        data = json.load(handle)
    session = load_session(data["session"])
    requests = [load_request(r, session) for r in data["requests"]]
    return session, requests


# --------------------------------------------------------------------------------------------------------
# 8. CLI, mirroring `generate-token.js <input.json> [--json]` (without --template/--no-check; see the
#    module docstring for why).
# --------------------------------------------------------------------------------------------------------


def main(argv: Optional[list[str]] = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("input", help="input.json: {\"session\": {...}, \"requests\": [...]}")
    parser.add_argument("--json", action="store_true", help="print {url, now, token} per request instead of one token per line")
    args = parser.parse_args(argv)

    session, requests = load_input(args.input)
    generator = TokenGenerator(session)
    for request in requests:
        token = generator.next(request)
        if args.json:
            print(json.dumps({"url": request.url, "now": request.now, "token": token}))
        else:
            print(token)
    return 0


if __name__ == "__main__":
    sys.exit(main())
