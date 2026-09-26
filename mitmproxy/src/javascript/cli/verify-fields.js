#!/usr/bin/env node
/**
 * Check the plaintext field rules (token-verifier/field-rules.js) against captured X-Net-Sync-Term tokens.
 *
 *   node verify-fields.js <tokens.json>
 *
 * Exits with 1 when any rule fails.
 */
const fs = require("node:fs");
const {checkFieldRules} = require("../token-verifier/field-rules");

const [input] = process.argv.slice(2);
if (!input) {
    console.error("Usage: verify-fields.js <tokens.json>");
    process.exit(2);
}
const capture = JSON.parse(fs.readFileSync(input, "utf8"));
const {checks} = checkFieldRules(capture.tokens, {serverTime: Number(capture.SERVER_TIME) || undefined});
for (const {name, ok, detail} of checks) console.log(`${ok ? "ok  " : "FAIL"} ${name}${detail ? `  (${detail})` : ""}`);
process.exit(checks.every(c => c.ok) ? 0 : 1);
