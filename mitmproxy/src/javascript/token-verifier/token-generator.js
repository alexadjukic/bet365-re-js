/**
 * Generator for X-Net-Sync-Term tokens: builds the header value of one request from what the page knows, using the field rules
 * of data/notes/x-net-sync-term.md (checked on real tokens by cli/regenerate-tokens.js). It sends nothing anywhere.
 *
 * A token needs three kinds of input, and this file keeps them apart:
 *
 *   session   what the server provided and what the browser is: fixed for a page load (see SESSION_INPUTS)
 *   request   what the page is doing at that moment: the URL, body, time and the events it observed (see REQUEST_INPUTS)
 *   state     kept by the generator: the token counter and the time of the last `Loader.load` (the rules of f.i_r and f.i_au)
 *
 * Everything else in the token is computed: `d`, the checksum `p`, the IV, `f.i_r`, `f.i_au`, `aa`, `f.i_pl`, `f.i_ws`, `f.i_df`,
 * `f.i_z`, the literals `f.i_vr`, `f.i_hp`, `f.i_kl`, `w`, and the order and types of all records.
 */
const {buildToken} = require("./token-encoder");
const {fnv1a32} = require("./token-verifier");
const {activityAge, flagC, pageAge, clockSkew, iWs, iDf, isCountedUrl, pubValue} = require("./field-rules");

/** Inputs that are fixed for a page load. `browser` is the fingerprint that can only be replayed from a real browser. */
const SESSION_INPUTS = {
    headerByte: "byte 1 of the token header: a build counter (72 in site version 16504, 73 in 16520)",
    sst: "atob(WebsiteConfig.SST) of the /defaultapi/sports-configuration response, a Buffer including its own 2-byte length",
    serverTime: "WebsiteConfig.SERVER_TIME of the page (seconds)",
    start: "Date.now() when the script started (ms); only its whole second and the ages derived from it matter",
    nonce: "the random 31-bit number of the page load (`b`)",
    userAgent: "navigator.userAgent",
    timezone: "IANA time zone (`z`)",
    timezoneOffset: "Date.getTimezoneOffset() as text, e.g. \"-120\" (`t`)",
    host: "location.host",
    manifestVersion: "_websiteManifest.v (`f.mv`)",
    bootState: "1 when the site looks fully booted, else 2 (`v`, `f.i_z`)",
    sessionId: "the pstk cookie (`s`), if any",
    currencyRate: "flashvars.CURRENCY_EXCHANGE_RATE (`j`), if set",
    countryId: "Locator.user.countryId (`o`), if set",
    username: "Locator.user.username (`n`), if logged in",
    browser: "{cc, canvasA, canvasB, canvasRandomised, persistentId, width, height, cores, knownUsers, uqid, loggedIn, referrer, clicks?}",
};

/** Inputs of one request. `now` is Date.now() when the token is built. */
const REQUEST_INPUTS = {
    now: "Date.now() at token time (ms)",
    kind: "\"http\" (a Loader request) or \"ws\" (a websocket handshake, subscribe or unsubscribe)",
    url: "ns_gen5_net.url: path and query of the request (websocket: /zap/?uid=...)",
    body: "request body, if any (`w` is its hash)",
    hash: "location.hash (`c`)",
    connectionId: "window.ns_datalib_readit.conId (`g`), empty for HTTP",
    stackClass: "\"I\", \"J\" or \"K\" from the call stack (`h`), see classifyStack",
    ips: "the WebRTC srflx IPs found so far, comma-joined (`i`), absent before the probe finished",
    scripts: "cumulative list of new <script> sources, \" ~ \"-joined (`f.p`), absent until one exists",
    iframes: "the same for iframes (`f.q`)",
    clicks: "click counter (`f.i_cl`), present once the click hook exists",
    pending: "{subscribe, unsubscribe} topic lists pending for this websocket message (build 16520+, `f.pub`)",
    loadTime: "time of the Loader.load call for an HTTP token (ms, default: now); only matters to f.i_au of later websocket tokens",
    flags: "{r, q}: the detector flag words (0 for an unmodified browser)",
};

class TokenGenerator {
    constructor(session) {
        this.session = session;
        this.tokens = 0;
        this.counter = 0;
        this.lastLoad = undefined;
    }

    /** Builds the token for one request. Returns {value, entries}: the header value and the ordered records it was built from. */
    next(request) {
        const {session} = this;
        const {browser} = session;
        const now = request.now;
        const first = this.tokens++ === 0;

        // f.i_r counts tokens except for some URLs (fn_44705); the Loader.load hook is installed by the first token and records
        // the time of every later HTTP load (fn_68509), which f.i_au measures
        if (isCountedUrl(request.url)) this.counter++;
        if (request.kind === "http" && !first) this.lastLoad = request.loadTime ?? now;
        const idle = activityAge(now, this.lastLoad);

        const pub = session.headerByte >= 73 && request.url.startsWith("/zap/") && request.pending
            ? pubValue(request.pending.subscribe, request.pending.unsubscribe) : undefined;
        const optional = (key, value) => (value === undefined || value === "" ? [] : [[key, value]]);
        const nested = [
            ["i_u", browser.knownUsers],
            ...optional("p", request.scripts),
            ...optional("q", request.iframes),
            ["i_r", this.counter],
            ["i_tf", 0], ["i_bt", 0],
            ...(request.clicks === undefined ? [] : [["i_cl", request.clicks]]),
            ["i_ps", browser.persistentId],
            ["uqid", browser.uqid ?? ""], ["uv", ""], ["ur", ""],
            ["ua", session.userAgent],
            ["il", browser.loggedIn ?? "false"],
            ["ul", request.url],
            ["rf", browser.referrer ?? ""],
            ["d", session.host],
            ["x", "s"],
            ["i_z", session.bootState],
            ["i_au", idle], ["i_pl", pageAge(now, session.start)],
            ["mv", session.manifestVersion],
            ["cc", browser.cc],
            ["i_ca", browser.canvasA], ["i_cb", browser.canvasB], ["i_cr", browser.canvasRandomised ? 1 : 0],
            ["i_df", iDf({cc: browser.cc, ca: browser.canvasA, cb: browser.canvasB, width: browser.width, height: browser.height, cores: browser.cores})],
            ["i_sw", browser.width], ["i_sh", browser.height], ["i_hc", browser.cores],
            ["i_vr", 157], ["i_hp", 66], ["i_kl", 231],
            ["i_ws", iWs(session.start)],
            ...(pub === undefined ? [] : [["pub", pub]]),
        ];
        const flags = request.flags || {};
        const entries = [
            ["a", "1"],
            ["b", session.nonce],
            ["c", request.hash ?? ""],
            ["d", now + clockSkew(session.serverTime, session.start)],
            ["e", session.userAgent],
            ["p", 0],   // recomputed by buildToken
            ["g", request.connectionId ?? ""],
            ...optional("h", request.stackClass),
            ...optional("i", request.ips),
            ...optional("j", session.currencyRate),
            ["k", session.host],
            ...optional("n", session.username),
            ...optional("o", session.countryId),
            ["q", flags.q ?? 0],
            ["r", flags.r ?? 0],
            ...optional("s", session.sessionId),
            ["t", session.timezoneOffset],
            ["u", request.url],
            ["v", session.bootState],
            ...(request.body ? [["w", fnv1a32(request.body)]] : []),
            ["x", browser.uqid ?? ""],
            ["z", session.timezone],
            ["ab", "s"],
            ["f", nested],
            ["aa", flagC(idle)],
        ];
        const header = Buffer.from([0x03, session.headerByte, 0x00, 0x04]);
        const value = buildToken({entries, sst: session.sst.subarray(2), ivTime: now, header});
        return {value, entries};
    }
}

module.exports = {SESSION_INPUTS, REQUEST_INPUTS, TokenGenerator};
