#!/usr/bin/env node
/**
 * Compare the server-provided inputs and the tokens of two sessions (files made by mitmproxy/src/python/main/extract-session.py).
 *
 *   node compare-sessions.js <session-a.json> <session-b.json>
 *
 * Prints: the page and config values (SST, `_h`, CW, TTI, SSI, SERVER_TIME, pstk), how the two SSTs relate (equal bytes,
 * shared substrings, XOR with the page SST), the timing of the script start against the page request, and which plaintext
 * fields are the same or differ between the sessions.
 */
const fs = require("node:fs");
const {decodeToken, findIvTime} = require("../token-verifier/token-verifier");
const {nestedFields} = require("../token-verifier/field-rules");

const [fileA, fileB] = process.argv.slice(2);
if (!fileB) {
    console.error("Usage: compare-sessions.js <session-a.json> <session-b.json>");
    process.exit(2);
}
const sessions = [fileA, fileB].map(file => JSON.parse(fs.readFileSync(file, "utf8")));
const bytes = b64 => Buffer.from(b64.replace(/-/g, "+").replace(/_/g, "/"), "base64");
const pstk = s => (s.config_set_cookie || []).map(c => /^pstk=([^;]+)/.exec(c)).find(Boolean)?.[1];
const entropy = buf => {
    const counts = new Map();
    for (const b of buf) counts.set(b, (counts.get(b) || 0) + 1);
    return -[...counts.values()].reduce((sum, n) => sum + (n / buf.length) * Math.log2(n / buf.length), 0);
};
const section = title => console.log(`\n== ${title}`);

section("Server-provided inputs");
const rows = [
    ["SITE_VERSION", s => s.SITE_VERSION], ["SERVER_TIME", s => s.SERVER_TIME], ["CW", s => JSON.stringify(s.CW)], ["TTI", s => s.TTI],
    ["SSI", s => `${s.SSI} = ${bytes(s.SSI).toString()}`], ["_h", s => s._h], ["pstk", pstk],
    ["page SST", s => `${bytes(s.SST).length} B, header ${bytes(s.SST).subarray(0, 4).toString("hex")}`],
    ["config SST", s => `${bytes(s.SST_CONFIG).length} B, header ${bytes(s.SST_CONFIG).subarray(0, 4).toString("hex")}`],
    ["config request cookies", s => (s.config_request_cookie || "").split(/,\s*/).map(c => c.split("=")[0]).join(", ")],
];
for (const [name, get] of rows) console.log(name.padEnd(24), sessions.map(get).join("   |   "));

section("How the SSTs relate");
const [pageA, pageB] = sessions.map(s => bytes(s.SST).subarray(4));
const [cfgA, cfgB] = sessions.map(s => bytes(s.SST_CONFIG).subarray(4));
const equalBytes = (a, b) => [...a].filter((byte, i) => i < b.length && byte === b[i]).length;
console.log(`config SST, same position equal bytes across sessions: ${equalBytes(cfgA, cfgB)}/${Math.min(cfgA.length, cfgB.length)} (chance: ${(Math.min(cfgA.length, cfgB.length) / 256).toFixed(1)})`);
console.log(`page SST,   same position equal bytes across sessions: ${equalBytes(pageA, pageB)}/${Math.min(pageA.length, pageB.length)} (chance: ${(Math.min(pageA.length, pageB.length) / 256).toFixed(1)})`);
sessions.forEach((s, i) => {
    const page = bytes(s.SST), cfg = bytes(s.SST_CONFIG), h = bytes(s._h);
    let shared = 0;
    for (let k = 0; k + 3 <= page.length; k++) if (cfg.includes(page.subarray(k, k + 3))) shared++;
    console.log(`session ${i + 1}: config-SST payload entropy ${entropy(cfg.subarray(4)).toFixed(2)} bits/byte; 3-byte substrings shared page/config: ${shared}; `
        + `the 16 bytes of _h occur inside an SST: ${page.includes(h) || cfg.includes(h)}`);
});

section("Timing (client clock and mitmproxy time are the same machine)");
sessions.forEach((s, i) => {
    const toks = s.tokens.map(t => {
        const {fields, iv} = decodeToken(t.value);
        return {now: findIvTime(iv, fields.b, Number(fields.d) - 60000, Number(fields.d) + 60000), d: Number(fields.d), ts: t.ts * 1000, f: nestedFields(fields.f), ws: t.method === "WS"};
    });
    const low = Math.max(...toks.map(t => t.now - t.f.i_pl * 1000 - 999)), high = Math.min(...toks.map(t => t.now - t.f.i_pl * 1000));
    const lag = list => `${Math.min(...list.map(t => t.ts - t.now)).toFixed(0)}..${Math.max(...list.map(t => t.ts - t.now)).toFixed(0)} ms`;
    console.log(`session ${i + 1}: floor(page request time) = ${Math.floor(s.page_ts)} vs SERVER_TIME ${s.SERVER_TIME}; script start ${(low - s.page_ts * 1000).toFixed(0)}..${(high - s.page_ts * 1000).toFixed(0)} ms after the page request `
        + `(second of start - SERVER_TIME = ${Math.floor(low / 1000) - s.SERVER_TIME}); d - now = ${[...new Set(toks.map(t => t.d - t.now))]} ms; request time minus token time: HTTP ${lag(toks.filter(t => !t.ws))}, WS ${lag(toks.filter(t => t.ws))}`);
});

section("Plaintext fields: same in both sessions or different");
const [a, b] = sessions.map(s => s.tokens.map(t => {
    const {fields, header} = decodeToken(t.value);
    return {...fields, ...Object.fromEntries(Object.entries(nestedFields(fields.f)).map(([k, v]) => [`f.${k}`, v])), header: header.toString("hex")};
}));
const keys = [...new Set([...a, ...b].flatMap(r => Object.keys(r)))].filter(k => !["f", "d", "p", "u", "c", "f.ul", "f.i_r", "f.i_au", "f.i_pl", "aa", "f.p", "f.pub", "f.i_ws"].includes(k));
const values = (rowsOf, k) => JSON.stringify([...new Set(rowsOf.map(r => r[k]))].sort());
const same = [], different = [], onlyOne = [];
for (const k of keys) {
    const [va, vb] = [values(a, k), values(b, k)];
    if (va === "[]" || vb === "[]") onlyOne.push(`${k} (${va === "[]" ? "only in B" : "only in A"})`);
    else (va === vb ? same : different).push(k);
}
console.log("same:", same.join(", "));
console.log("different:", different.join(", "));
console.log("present in one session only:", onlyOne.join(", ") || "none");
console.log("header bytes:", values(a, "header"), "->", values(b, "header"));
