# X-Net-Sync-Term token tools

Offline tools for the `X-Net-Sync-Term` header of `www.bet365.rs`: decode and verify captured tokens, check the field rules, and **generate tokens from inputs**. Nothing here sends a request; every tool reads files and the clock.

The background (format, field rules, how it was found) is in `data/notes/x-net-sync-term.md` (gitignored). This file is about using the generator.

- [What the generator does and does not do](#what-the-generator-does-and-does-not-do)
- [Quick start](#quick-start)
- [The command](#the-command)
- [The input file](#the-input-file)
- [Where each value comes from](#where-each-value-comes-from)
- [What is computed for you](#what-is-computed-for-you)
- [Output and self-check](#output-and-self-check)
- [Worked examples](#worked-examples)
- [Using it as a library](#using-it-as-a-library)
- [The other tools](#the-other-tools)
- [Limits](#limits)

## What the generator does and does not do

It builds the header value of a request from inputs, following the field rules read from the site's script. It was checked by regenerating **151 of 151 captured tokens byte for byte** (three sessions, two site builds), and changing any input breaks the tokens it affects.

It does **not**:

- create an SST (the server-issued value inside every token). You need one from a capture (the `SST` of the `/defaultapi/sports-configuration` response);
- compute the browser fingerprints (`cc`, the two canvas hashes). They come from a real browser's rendering and can only be replayed from a capture;
- say anything about whether a server would accept a token. No request to the site was made or is planned.

A token built from a real SST and a real fingerprint is internally consistent (checksum, IV, all field rules pass). That is all it claims.

## Quick start

```sh
# 1. Turn a captured session into an input file (its session values and its first 3 requests)
node mitmproxy/src/javascript/cli/generate-token.js --template data/captures/session3.json 3 > input.json

# 2. Edit input.json (see "The input file"), e.g. use the clock instead of the captured times

# 3. Generate; every token is checked before it is printed
node mitmproxy/src/javascript/cli/generate-token.js input.json
```

A captured session file is made from a mitmproxy flows file with
`venv/bin/python mitmproxy/src/python/main/extract-session.py flows3 data/captures/session3.json`.

## The command

```
node mitmproxy/src/javascript/cli/generate-token.js <input.json> [--json] [--no-check]
node mitmproxy/src/javascript/cli/generate-token.js --template <session.json> [count]
```

| Option | Meaning |
|---|---|
| `<input.json>` | The input file (next section). One token is printed per request, in the order given. |
| `--json` | Print one JSON object per request instead of a bare token: `{url, now, token, fields}`, where `fields` are the decoded records (the nested block `f` decoded as well). |
| `--no-check` | Skip the self-check. |
| `--template <session.json> [count]` | Print an input file made from a captured session: its session values, its SST as base64, and its first `count` requests (default 3), each with the values the capture had. |

Exit status: `0` success; `1` the self-check failed (details on stderr; tokens are still printed); `2` invalid input (a message names the field).

## The input file

```json
{
  "session":  { ... },
  "requests": [ { ... }, { ... } ]
}
```

The requests are treated as **the tokens of one page load, in order**: the generator counts them (`f.i_r`) and remembers when the last HTTP request was made (`f.i_au`). Put a websocket request after the HTTP requests you want it to follow.

### `session`: fixed for a page load

| Field | Required | Meaning |
|---|---|---|
| `headerByte` | yes | Byte 1 of the token header, a build number: `72` in site version 16504, `73` in 16520. `73` and later also add the `pub` field (see below). |
| `sst` | yes | The SST as base64, exactly as in the config response: `WebsiteConfig.SST` of `/defaultapi/sports-configuration` (not the one embedded in the page HTML). Its first two bytes must be its own length. |
| `serverTime` | yes | `WebsiteConfig.SERVER_TIME` of the page, in seconds; or `"now"` (the page was generated now). |
| `start` | yes | When the page's script started, in ms since the epoch; or `"now"`. Only its whole second and the ages derived from it matter. |
| `nonce` | yes | The page load's random 31-bit number (`b`); or `"random"`. |
| `userAgent` | yes | `navigator.userAgent`. |
| `timezone` | yes | IANA time zone, e.g. `"Europe/Belgrade"` (`z`). |
| `timezoneOffset` | yes | `new Date().getTimezoneOffset()` as text, e.g. `"-120"` (`t`). |
| `host` | yes | `location.host`, e.g. `"www.bet365.rs"`. |
| `manifestVersion` | yes | The site version, e.g. `"16520"` (`f.mv`). |
| `bootState` | yes | `2` in every capture (`1` when the site looks fully booted). |
| `browser` | yes | The browser profile, below. |
| `sessionId` | no | The `pstk` cookie (`s`). |
| `currencyRate` | no | `flashvars.CURRENCY_EXCHANGE_RATE` (`j`). |
| `countryId` | no | `Locator.user.countryId` (`o`), e.g. `"240"`. |
| `username` | no | `Locator.user.username` (`n`), logged-in sessions only. |

`session.browser`:

| Field | Required | Meaning |
|---|---|---|
| `cc` | yes | The system-colour hash (64 hex characters). |
| `canvasA`, `canvasB` | yes | The two canvas hashes (32-bit numbers). |
| `canvasRandomised` | no | `true` if the browser's canvas differs between two identical draws (default `false`). |
| `persistentId` | yes | The random id in `localStorage.cf3` (`f.i_ps`). |
| `width`, `height` | yes | `screen.width`, `screen.height`. |
| `cores` | yes | `navigator.hardwareConcurrency`. |
| `knownUsers` | yes | Number of entries in `localStorage.cf4` (`f.i_u`), `1` for a logged-out browser. |
| `uqid` | no | Cookie attribute `usdi`/`uqid` (default `""`). |
| `loggedIn` | no | `"true"` / `"false"` (default `"false"`). |
| `referrer` | no | `document.referrer` (default `""`). |

### `requests[]`: one per token

| Field | Required | Meaning |
|---|---|---|
| `kind` | yes | `"http"` (a request made by the site's `Loader`) or `"ws"` (a websocket handshake, subscribe or unsubscribe). |
| `url` | yes | Path and query, starting with `/`: the request URL for HTTP, `/zap/?uid=...` for websocket. |
| `now` | no | `Date.now()` when the token is built, in ms (default: the clock, but never before `session.start`). |
| `body` | no | The request body text (`w` is its hash). |
| `hash` | no | `location.hash`, e.g. `"#/HO/"` (`c`). |
| `connectionId` | no | The websocket connection id (`g`); empty for HTTP. |
| `stackClass` | no | `"I"`, `"J"` or `"K"` (`h`): `I` when the call comes through the site's deferred-call queue, `J` when the stack shows `eval`, otherwise `K`. Omitted if not given. |
| `ips` | no | The WebRTC public IPs found so far, comma-joined (`i`). The first token of a page load has none. |
| `scripts` | no | Cumulative list of new `<script>` sources, each as `" ~ " + url` (no query string) (`f.p`). |
| `iframes` | no | The same for iframes (`f.q`). |
| `clicks` | no | The click counter (`f.i_cl`). Present in real tokens once the click hook exists. |
| `pending` | no | `{"subscribe": "A,B", "unsubscribe": "C"}`: the topics of the websocket message (`f.pub`). Only used for `"ws"` requests with `headerByte` 73 or later. |
| `loadTime` | no | Time of the `Loader.load` call of an HTTP request, in ms. Only matters for `f.i_au` of later websocket requests; used to reproduce captures. Ignored (with a warning) if `now` is not given. |
| `flags` | no | `{"r": 0, "q": 0}`: the detector flag words. `0` is what an unmodified browser sends. |

## Where each value comes from

| Value | Where to get it |
|---|---|
| `sst`, `serverTime`, `manifestVersion` | The captured session file (from `extract-session.py`), or the config response and the page. |
| `sessionId`, `countryId`, `currencyRate` | The captured tokens (`s`, `o`, `j`) or the `pstk` cookie. |
| `userAgent`, `timezone`, `timezoneOffset`, `host` | The browser (`navigator.userAgent`, `Intl.DateTimeFormat().resolvedOptions().timeZone`, `new Date().getTimezoneOffset()`, `location.host`). |
| `browser.*` | A captured token's decoded fields (`f.cc`, `f.i_ca`, `f.i_cb`, `f.i_cr`, `f.i_ps`, `f.i_sw`, `f.i_sh`, `f.i_hc`, `f.i_u`). `--template` fills them from the session you name. |
| `nonce`, `start`, `now` | Free to choose (`"random"`, `"now"`). |
| `stackClass`, `ips`, `scripts`, `connectionId`, `clicks`, `pending` | Events the page observes; take them from a captured token, or leave them out. |

## What is computed for you

You never supply these; the generator derives them, and they are the reason the self-check can catch inconsistent inputs:

| Field | Rule |
|---|---|
| `d` | `now + 1000 * (serverTime - whole seconds of start)` |
| `p` | the checksum of `b`, `r`, `q`, `z`, `d`, `v` |
| IV | derived from `now` and the nonce; the ciphertext follows |
| `f.i_r` | the token counter, not advanced by URLs containing `betbuilder`, `searchapi`, `streamingapi`, `streamingmonitor` or `/sports-assets/` |
| `f.i_au`, `aa` | seconds since the last HTTP request (`1111` before one was seen); `aa` is `1` when that is neither `0` nor `1111` |
| `f.i_pl` | seconds since `start` |
| `f.i_ws` | a scrambled 3-day bucket of `start` |
| `f.i_df` | `fnv1a32(cc + canvasA + canvasB + width + "x" + height + cores)` |
| `f.i_z` | `bootState` |
| `f.i_vr`, `f.i_hp`, `f.i_kl` | the literals 157, 66, 231 |
| `w` | `fnv1a32(body)` when a body is given |
| record order and integer widths | as in the site's script |

## Output and self-check

Default output: one base64 token per line, the value for the `X-Net-Sync-Term` header (websocket: the part after `A_`).

Unless `--no-check` is given, every token is decoded and run through the verifier (checksum, IV, SST, `u`/`k`/`e`/`z` fields) and all field rules. Failures are printed to stderr, for example `field rule failed: f.i_au = ...`, and the exit status is `1`.

Warnings go to stderr and do not change the status:

- `serverTime` and `start` more than a minute apart: `d` would then differ from the token time by that much, which no real page does. Use `"serverTime": "now"` together with `"start": "now"`.
- a `loadTime` without its own `now` is ignored.

## Worked examples

**Reproduce a captured token.** A template fed straight back in gives the captured tokens exactly:

```sh
node mitmproxy/src/javascript/cli/generate-token.js --template data/captures/session3.json 2 > input.json
node mitmproxy/src/javascript/cli/generate-token.js input.json
```

**Use the clock.** Edit `input.json`: set `session.start` and `session.serverTime` to `"now"`, `session.nonce` to `"random"`, and delete `now` from every request. Request `n+1` is then a later token of the same page load:

```json
{
  "session": { "headerByte": 73, "serverTime": "now", "start": "now", "nonce": "random", "...": "the rest as in the template" },
  "requests": [
    { "kind": "http", "url": "/pullpodapi/gethomepagepods?lid=37&zid=0", "hash": "#/HO/", "stackClass": "I", "clicks": 0 },
    { "kind": "http", "url": "/offersapi/offersml?countryid=240&languageid=37", "hash": "#/HO/", "stackClass": "K", "clicks": 3 },
    { "kind": "ws",   "url": "/zap/?uid=1677508943211946", "connectionId": "I1BRW47-...", "pending": { "subscribe": "IPHP_37" } }
  ]
}
```

**Inspect the fields.**

```sh
node mitmproxy/src/javascript/cli/generate-token.js input.json --json | head -1
```

**An older site build.** Set `session.headerByte` to `72`; the `pub` field is then not produced.

## Using it as a library

```js
const {TokenGenerator} = require("./token-generator");
const {parseInput} = require("./generate-input");

const {session, requests} = parseInput(JSON.parse(fs.readFileSync("input.json", "utf8")));
const generator = new TokenGenerator(session);
for (const request of requests) {
    const {value, entries} = generator.next(request);   // value: the header value, entries: the ordered records
}
```

`SESSION_INPUTS` and `REQUEST_INPUTS` in `token-generator.js` list every input with its meaning.

## The other tools

All under `mitmproxy/src/javascript/cli/` unless noted; all take a session file made by `extract-session.py`.

| Tool | Purpose |
|---|---|
| `verify-tokens.js <session.json>` | Decode every token and check header, checksum, IV, SST and the basic fields. |
| `verify-fields.js <session.json>` | Check the field rules (`f.i_r`, `f.i_au`, `aa`, `f.i_pl`, the skew of `d`, `f.i_df`, flag stickiness, `f.pub`, ...). |
| `roundtrip-tokens.js <session.json>` | Re-encode every decoded token and compare. |
| `regenerate-tokens.js <session.json>` | Regenerate every token from its inputs with the generator and compare byte for byte. |
| `compare-sessions.js <a.json> <b.json>` | Compare the server-provided inputs and plaintext fields of two sessions. |
| `disassemble-vm.js <bundle>` and `compare-vm-builds.js <a> <b>` | Disassemble the VM program of a build and diff two builds. |
| `mitmproxy/src/python/main/extract-session.py <flows> <out.json>` | Make a session file from a mitmproxy flows file. |

## Limits

- The SST and the browser fingerprints must come from a real capture.
- A page load is modelled from its tokens in order; requests should be listed in creation order.
- Paths no capture has exercised are implemented from the code but unverified: `w` (request bodies), the `J` stack class, `f.q` (iframes), logged-in fields, and every detector flag except the one that fired once (bit 20 of `r`).
- Tokens were only checked against captured tokens and the field rules. Whether a server accepts, rejects or scores a token is unknown.
