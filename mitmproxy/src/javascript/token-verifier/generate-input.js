/**
 * The JSON input of cli/generate-token.js: parsing, validation and the defaults that may come from the clock and a random number.
 * Everything here is offline; nothing is sent anywhere. The meaning of every field is in token-generator.js (SESSION_INPUTS, REQUEST_INPUTS).
 *
 *   {
 *     "session":  { "headerByte": 73, "sst": "<base64 of atob(WebsiteConfig.SST)>", "serverTime": "now" | <seconds>, "start": "now" | <ms>,
 *                   "nonce": "random" | <number>, "userAgent": "...", "timezone": "Europe/Belgrade", "timezoneOffset": "-120",
 *                   "host": "www.bet365.rs", "manifestVersion": "16520", "bootState": 2,
 *                   "sessionId": "...", "currencyRate": "...", "countryId": "240", "username": "...",   (all optional)
 *                   "browser": { "cc": "...", "canvasA": 0, "canvasB": 0, "canvasRandomised": false, "persistentId": 0, "width": 1920,
 *                                "height": 1080, "cores": 12, "knownUsers": 1, "uqid": "", "loggedIn": "false", "referrer": "" } },
 *     "requests": [ { "kind": "http" | "ws", "url": "/path?query", "now": <ms, default: the clock>, "body", "hash", "connectionId", "stackClass",
 *                     "ips", "scripts", "iframes", "clicks", "pending": {"subscribe", "unsubscribe"}, "loadTime", "flags": {"r", "q"} } ]
 *   }
 */
const {inputsFromCapture} = require("./capture-inputs");

const REQUIRED_SESSION = ["headerByte", "sst", "serverTime", "start", "nonce", "userAgent", "timezone", "timezoneOffset", "host", "manifestVersion", "bootState", "browser"];
const REQUIRED_BROWSER = ["cc", "canvasA", "canvasB", "persistentId", "width", "height", "cores", "knownUsers"];
const NUMERIC_SESSION = ["headerByte", "bootState"];

function fail(message) {
    throw new Error(`invalid input: ${message}`);
}

/**
 * Validates the input and resolves "now" / "random" / base64; returns {session, requests, warnings} ready for TokenGenerator.
 * `serverTime: "now"` means the page was generated at this moment. A real page's SERVER_TIME is within a second or so of its script
 * start; when the two differ by much more, `d` is offset from the token time by that difference, which is reported as a warning.
 */
function parseInput(input, {clock = Date.now, random = Math.random} = {}) {
    if (!input || typeof input !== "object" || !input.session || !Array.isArray(input.requests)) fail('expected {"session": {...}, "requests": [...]}');
    const raw = input.session;
    for (const key of REQUIRED_SESSION) if (raw[key] === undefined) fail(`session.${key} is missing`);
    for (const key of REQUIRED_BROWSER) if (raw.browser[key] === undefined) fail(`session.browser.${key} is missing`);
    for (const key of NUMERIC_SESSION) if (typeof raw[key] !== "number") fail(`session.${key} must be a number`);
    if (!Number.isInteger(raw.headerByte) || raw.headerByte < 0 || raw.headerByte > 255) fail("session.headerByte must be a byte (72 in site version 16504, 73 in 16520)");

    const sst = Buffer.from(String(raw.sst), "base64");
    if (sst.length < 3 || sst.readUInt16BE(0) !== sst.length - 2) fail("session.sst must be the base64 of atob(WebsiteConfig.SST), whose first two bytes are its own length");
    if (raw.serverTime !== "now" && typeof raw.serverTime !== "number") fail('session.serverTime must be a number of seconds or "now"');
    const start = raw.start === "now" ? clock() : raw.start;
    if (typeof start !== "number") fail('session.start must be a number of milliseconds or "now"');
    const nonce = raw.nonce === "random" ? Math.floor(random() * 2147483647) : raw.nonce;
    if (!Number.isInteger(nonce) || nonce < 0 || nonce > 2147483647) fail('session.nonce must be an integer below 2^31 or "random"');

    const serverTime = raw.serverTime === "now" ? Math.floor(clock() / 1000) : raw.serverTime;
    const session = {...raw, sst, start, nonce, serverTime};
    const warnings = [];
    const offset = Math.abs(serverTime * 1000 - start);
    if (offset > 60000) warnings.push(`session.serverTime is ${Math.round(offset / 1000)} s away from session.start: the token's d will differ from its IV time by about that much (a real page has them within a second or two; use "serverTime": "now" with "start": "now")`);
    const requests = input.requests.map((request, index) => {
        if (!request || !["http", "ws"].includes(request.kind)) fail(`requests[${index}].kind must be "http" or "ws"`);
        if (typeof request.url !== "string" || !request.url.startsWith("/")) fail(`requests[${index}].url must be a path and query starting with /`);
        const now = request.now === undefined ? Math.max(clock(), start) : request.now;
        if (typeof now !== "number") fail(`requests[${index}].now must be a number of milliseconds`);
        if (now < start) fail(`requests[${index}].now is before session.start (the page age would be negative)`);
        if (request.now === undefined && request.loadTime !== undefined) {
            // an absolute time recorded together with the capture's own `now`; with the clock as `now` it would make f.i_au nonsense
            warnings.push(`requests[${index}].loadTime is ignored because requests[${index}].now is not given (loadTime only makes sense with its own now)`);
            const {loadTime, ...rest} = request;
            return {...rest, now};
        }
        return {...request, now};
    });
    return {session, requests, warnings, ivWindow: offset + 60000};
}

/** An input file for a capture (a session file made by extract-session.py): the first `count` requests with the values the capture had. */
function templateFromCapture(capture, count = 3) {
    const {session, requests} = inputsFromCapture(capture);
    const plain = value => JSON.parse(JSON.stringify(value));
    return {
        session: {...plain({...session, sst: undefined}), sst: session.sst.toString("base64")},
        requests: requests.slice(0, count).map(request => plain(request)),
    };
}

module.exports = {parseInput, templateFromCapture};
