#!/usr/bin/env node
/**
 * Check captured X-Net-Sync-Term tokens against the documented scheme (data/notes/x-net-sync-term.md).
 *
 *   node verify-tokens.js <tokens.json> [--verbose]
 *
 * tokens.json: {"SST": base64 from the page, "SST_CONFIG": base64 from the sports-configuration response (optional), "SERVER_TIME": seconds, "user-agent": "...", "timezone": "...",
 *               "tokens": [{"value": "<header value>", "url": "...", "method": "GET", "body": null}]}
 * Exits with 1 when any check fails.
 */
const fs = require("node:fs");
const {verifyToken} = require("../token-verifier/token-verifier");

const args = process.argv.slice(2);
const verbose = args.includes("--verbose");
const [input] = args.filter(a => !a.startsWith("--"));
if (!input) {
    console.error("Usage: verify-tokens.js <tokens.json> [--verbose]");
    process.exit(2);
}

const capture = JSON.parse(fs.readFileSync(input, "utf8"));
const session = {
    // the page's SST is replaced by the one in the /defaultapi/sports-configuration response (SST_CONFIG)
    sst: capture.SST_CONFIG || capture.SST,
    serverTime: Number(capture.SERVER_TIME) || undefined,
    userAgent: capture["user-agent"],
    timezone: capture.timezone,
    pageHost: capture.tokens.map(t => new URL(t.url)).find(u => !u.pathname.includes("/zap/"))?.hostname,
};

const totals = new Map();
capture.tokens.forEach((entry, index) => {
    const {checks} = verifyToken(entry.value, session, {url: entry.url});
    const failed = checks.filter(c => !c.ok);
    console.log(`#${index} ${entry.method || ""} ${entry.url.slice(0, 80)}: ${failed.length ? "FAIL " + failed.map(c => c.name).join("; ") : "ok"}`);
    if (verbose) for (const c of checks) console.log(`    ${c.ok ? "ok  " : "FAIL"} ${c.name}${c.detail ? " (" + c.detail + ")" : ""}`);
    for (const c of checks) {
        const total = totals.get(c.name) || {ok: 0, fail: 0, detail: ""};
        total[c.ok ? "ok" : "fail"]++;
        if (!c.ok && !total.detail) total.detail = c.detail;
        totals.set(c.name, total);
    }
});

console.log("\nSummary");
let anyFailed = false;
for (const [name, {ok, fail, detail}] of totals) {
    anyFailed ||= fail > 0;
    console.log(`  ${fail ? "FAIL" : "ok  "} ${name}: ${ok}/${ok + fail}${fail && detail ? "  e.g. " + detail : ""}`);
}
process.exit(anyFailed ? 1 : 0);
