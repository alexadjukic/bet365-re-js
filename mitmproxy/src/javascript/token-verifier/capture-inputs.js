/**
 * Reads the generator's inputs (token-generator.js: session and per-request) out of a captured session, so that the
 * generator can be tested by regenerating the captured tokens. `capture` is a file made by mitmproxy/src/python/main/extract-session.py.
 *
 * Everything here is either something the page provides (the server values, the browser profile) or an event the page
 * observed (the stack class, the WebRTC IPs, the scripts that appeared, the websocket topics). Nothing is taken from a field
 * that the generator computes, except `start` and `loadTime`, which no capture records: they are chosen inside the window
 * that the captured `f.i_pl`, `d` and `f.i_au` values allow.
 */
const {decodeToken, findIvTime} = require("./token-verifier");
const {nestedFields} = require("./field-rules");
const {NO_ACTIVITY} = require("./field-rules");
const {clockSkew} = require("./field-rules");

function readTokens(capture) {
    const rows = capture.tokens.map((token, index) => {
        const {fields, iv, header} = decodeToken(token.value);
        const now = findIvTime(iv, fields.b, Number(fields.d) - 60000, Number(fields.d) + 60000);
        return {index, token, fields, f: nestedFields(fields.f), header, now};
    });
    return rows.sort((a, b) => a.now - b.now || a.f.i_r - b.f.i_r);
}

/** The script start time: the earliest time that gives every token's f.i_pl and the skew of `d` (see checkFieldRules). */
function startTime(rows, serverTime) {
    const low = Math.max(...rows.map(r => r.now - r.f.i_pl * 1000 - 999));
    const high = Math.min(...rows.map(r => r.now - r.f.i_pl * 1000));
    const skew = Number(rows[0].fields.d) - rows[0].now;
    const second = (serverTime - skew / 1000) * 1000;
    const start = Math.max(low, second);
    if (start > Math.min(high, second + 999)) throw new Error("no script start time fits the captured f.i_pl and d");
    return start;
}

/** For each HTTP token after the first: a time of its Loader.load call that reproduces the f.i_au of the websocket tokens that follow it. */
function loadTimes(rows) {
    const times = new Map();
    let current;
    for (const row of rows) {
        if (row.token.method !== "WS") {
            if (row !== rows[0]) current = {row, low: -Infinity, high: row.now};
            if (current) times.set(row, current);
        } else if (current && row.f.i_au !== NO_ACTIVITY) {
            current.low = Math.max(current.low, row.now - (row.f.i_au + 1) * 1000);   // exclusive
            current.high = Math.min(current.high, row.now - row.f.i_au * 1000);
        }
    }
    return new Map([...times].map(([row, {low, high}]) => [row, low < high ? high : row.now]));
}

function inputsFromCapture(capture) {
    const rows = readTokens(capture);
    const [first] = rows;
    const {fields, f} = first;
    const session = {
        headerByte: first.header[1],
        sst: Buffer.from(capture.SST_CONFIG || capture.SST, "base64"),
        serverTime: capture.SERVER_TIME,
        start: startTime(rows, capture.SERVER_TIME),
        nonce: fields.b, userAgent: fields.e, timezone: fields.z, timezoneOffset: fields.t, host: fields.k,
        manifestVersion: f.mv, bootState: fields.v, sessionId: fields.s, currencyRate: fields.j, countryId: fields.o, username: fields.n,
        browser: {cc: f.cc, canvasA: f.i_ca, canvasB: f.i_cb, canvasRandomised: f.i_cr === 1, persistentId: f.i_ps, width: f.i_sw, height: f.i_sh,
            cores: f.i_hc, knownUsers: f.i_u, uqid: f.uqid, loggedIn: f.il, referrer: f.rf},
    };
    const loads = loadTimes(rows);
    const requests = rows.map(row => {
        const message = row.token;
        const pending = row.f.pub !== undefined && message.topics !== undefined
            ? {subscribe: message.message_type === 0x16 ? message.topics : "", unsubscribe: message.message_type === 0x17 ? message.topics : ""} : undefined;
        return {
            now: row.now, kind: message.method === "WS" ? "ws" : "http", url: row.fields.u, body: message.body || undefined, hash: row.fields.c,
            connectionId: row.fields.g, stackClass: row.fields.h, ips: row.fields.i, scripts: row.f.p, iframes: row.f.q, clicks: row.f.i_cl,
            pending, loadTime: loads.get(row), flags: {r: row.fields.r, q: row.fields.q},
        };
    });
    return {session, requests, rows};
}

module.exports = {readTokens, startTime, loadTimes, inputsFromCapture, clockSkew};
