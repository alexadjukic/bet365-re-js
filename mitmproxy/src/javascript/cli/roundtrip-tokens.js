#!/usr/bin/env node
/**
 * Rebuild every captured X-Net-Sync-Term token from its decoded field values and compare it with the original.
 *
 *   node roundtrip-tokens.js <tokens.json>
 *
 * Three levels per token:
 *   raw     decrypted records re-encrypted with the original IV (proves the container and the cipher)
 *   fields  records re-encoded from the field values, original IV and checksum (proves the record encoding)
 *   derived records re-encoded from the field values with IV and checksum p recomputed (proves the derivations)
 * Exits with 1 when any token is not reproduced byte for byte.
 */
const fs = require("node:fs");
const {base64ToBuffer, decodeToken} = require("../token-verifier/token-verifier");
const {assembleToken, buildToken, toBuildInput} = require("../token-verifier/token-encoder");

const [input] = process.argv.slice(2);
if (!input) {
    console.error("Usage: roundtrip-tokens.js <tokens.json>");
    process.exit(2);
}

const normalise = value => base64ToBuffer(value).toString("base64");
const capture = JSON.parse(fs.readFileSync(input, "utf8"));
const totals = {raw: 0, fields: 0, derived: 0};
let failed = false;

capture.tokens.forEach((entry, index) => {
    const original = normalise(entry.value);
    const decoded = decodeToken(original);
    const input = toBuildInput(original);
    const results = {
        raw: assembleToken({header: decoded.header, sst: decoded.sst, iv: decoded.iv, plaintext: decoded.plaintext}) === original,
        fields: buildToken({...input, keepChecksum: true, iv: decoded.iv}) === original,
        derived: buildToken(input) === original,
    };
    for (const [level, ok] of Object.entries(results)) if (ok) totals[level]++;
    if (Object.values(results).some(ok => !ok)) {
        failed = true;
        console.log(`#${index} ${entry.url.slice(0, 70)}: ${Object.entries(results).filter(([, ok]) => !ok).map(([level]) => level).join(", ")} differ`);
    }
});

const count = capture.tokens.length;
console.log(`raw ${totals.raw}/${count}, fields ${totals.fields}/${count}, derived ${totals.derived}/${count}`);
process.exit(failed ? 1 : 0);
