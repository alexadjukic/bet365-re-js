#!/usr/bin/env node
/**
 * Compare the VM programs of two builds of the bundle and list what changed.
 *
 *   node compare-vm-builds.js <bundle-a.js> <bundle-b.js> [--names names-a.json] [--write-names names-b.json]
 *
 * Each input is a bundle or a whole Blob response containing the VM. The opcode table, string key and special registers of
 * each build are derived from its own interpreter (vm-profile.js). Functions are matched by their instruction and constant
 * sequence; --names carries function names from build A to the matching functions of build B (--write-names saves them).
 */
const fs = require("node:fs");
const {base64ToBytes, decodeProgram, extractProgramBase64, makeProfile} = require("../vm-disassembler/vm-disassembler");
const {carveVmChunk, extractProfile} = require("../vm-disassembler/vm-profile");
const {badJumpTargets, splitFunctions, compareFunctions, transferNames} = require("../vm-disassembler/vm-compare");

const args = process.argv.slice(2);
const option = name => (args.includes(name) ? args[args.indexOf(name) + 1] : undefined);
const files = args.filter((a, i) => !a.startsWith("--") && !(i > 0 && args[i - 1].startsWith("--")));
if (files.length !== 2) {
    console.error("Usage: compare-vm-builds.js <bundle-a.js> <bundle-b.js> [--names names-a.json] [--write-names names-b.json]");
    process.exit(2);
}

function load(file) {
    const chunk = carveVmChunk(fs.readFileSync(file, "utf8"));
    const derived = extractProfile(chunk);
    const bytes = base64ToBytes(extractProgramBase64(chunk)[0]);
    const instructions = decodeProgram(bytes, makeProfile(derived));
    return {derived, bytes, instructions, functions: splitFunctions(instructions)};
}

const [a, b] = files.map(load);
const hex = n => `0x${n.toString(16)}`;
[["A", a], ["B", b]].forEach(([label, build]) => console.log(`${label}: ${build.bytes.length} bytes, ${build.instructions.length} instructions, ${build.functions.length} functions, `
    + `string key ${hex(build.derived.stringMask)}, registers ${Object.entries(build.derived.registers).map(([k, v]) => `${k}=${hex(v)}`).join(" ")}, `
    + `unknown handlers ${build.derived.unknown.length}, bad jump targets ${badJumpTargets(build.instructions).length}`));

const {matched, onlyA, onlyB} = compareFunctions(a.functions, b.functions);
console.log(`\nidentical functions: ${matched.length}, only in A: ${onlyA.length}, only in B: ${onlyB.length}`);
const describe = fn => `  fn_${fn.address} (${fn.instructions.length} instructions) constants: ${JSON.stringify(fn.constants.slice(0, 12))}`;
console.log("\nonly in A:\n" + (onlyA.map(describe).join("\n") || "  none"));
console.log("\nonly in B:\n" + (onlyB.map(describe).join("\n") || "  none"));

const namesFile = option("--names");
if (namesFile) {
    const carried = transferNames(matched, JSON.parse(fs.readFileSync(namesFile, "utf8")));
    console.log(`\n${Object.keys(carried).length} function names carried over`);
    if (option("--write-names")) fs.writeFileSync(option("--write-names"), JSON.stringify(carried, null, 2) + "\n");
}
