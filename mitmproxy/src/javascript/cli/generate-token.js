#!/usr/bin/env node
/**
 * Generate X-Net-Sync-Term tokens from a JSON file of inputs, entirely offline (nothing is sent anywhere).
 *
 *   node generate-token.js <input.json> [--json] [--no-check]
 *   node generate-token.js --template <session.json> [count]
 *
 * <input.json>  {"session": {...}, "requests": [...]}, see token-verifier/generate-input.js for every field and token-generator.js
 *               for what each input means. Requests without "now" use the clock; session.start "now", session.serverTime "now" and
 *               nonce "random" are allowed (a template from a capture has the capture's own, old, serverTime).
 * --template    print an input file made from a captured session (from mitmproxy/src/python/main/extract-session.py): its session values
 *               and its first `count` requests (default 3), to edit and feed back in.
 * --json        print {token, fields} per request instead of one token per line.
 * --no-check    skip the self-check. By default every token is decoded and run through the token verifier and the field rules;
 *               a failed check is reported on stderr and the exit status is 1.
 *
 * Tokens are printed in the order given; the generator counts them as the tokens of one page load (f.i_r, f.i_au).
 * A token built from a replayed SST and browser profile is internally consistent, but the tool cannot say whether a server would accept it.
 */
const fs = require("node:fs");
const {parseInput, templateFromCapture} = require("../token-verifier/generate-input");
const {TokenGenerator} = require("../token-verifier/token-generator");
const {decodeToken, verifyToken} = require("../token-verifier/token-verifier");
const {checkFieldRules, nestedFields} = require("../token-verifier/field-rules");

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith("--")));
const positional = args.filter(a => !a.startsWith("--"));
const usage = "Usage: generate-token.js <input.json> [--json] [--no-check]\n       generate-token.js --template <session.json> [count]";

try {
    if (flags.has("--template")) {
        const [file, count] = positional;
        if (!file) throw new Error(usage);
        process.stdout.write(JSON.stringify(templateFromCapture(JSON.parse(fs.readFileSync(file, "utf8")), count ? Number(count) : 3), null, 2) + "\n");
        process.exit(0);
    }
    const [file] = positional;
    if (!file) throw new Error(usage);
    const {session, requests, warnings, ivWindow} = parseInput(JSON.parse(fs.readFileSync(file, "utf8")));
    for (const warning of warnings) console.error(`warning: ${warning}`);
    const generator = new TokenGenerator(session);
    const generated = requests.map(request => ({request, ...generator.next(request)}));

    let failures = 0;
    if (!flags.has("--no-check")) {
        const host = session.host;
        for (const {request, value} of generated) {
            const {checks} = verifyToken(value, {userAgent: session.userAgent, timezone: session.timezone, pageHost: host, ivWindow}, {url: `https://${host}${request.url}`});
            for (const check of checks.filter(c => !c.ok && !(c.name.startsWith("header is") && session.headerByte !== 72))) {
                console.error(`check failed for ${request.url}: ${check.name} ${check.detail}`);
                failures++;
            }
        }
        const {checks} = checkFieldRules(generated.map(g => ({value: g.value, url: `https://${host}${g.request.url}`})), {serverTime: session.serverTime, ivWindow});
        for (const check of checks.filter(c => !c.ok)) {
            console.error(`field rule failed: ${check.name} ${check.detail}`);
            failures++;
        }
    }
    for (const {request, value} of generated) {
        if (flags.has("--json")) {
            const {fields} = decodeToken(value);
            console.log(JSON.stringify({url: request.url, now: request.now, token: value, fields: {...fields, f: nestedFields(fields.f)}}));
        } else console.log(value);
    }
    process.exit(failures ? 1 : 0);
} catch (error) {
    console.error(error.message);
    process.exit(2);
}
