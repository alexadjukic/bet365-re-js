#!/usr/bin/env node
/**
 * Disassemble the bytecode program embedded in a VM-protected bundle (the `__vm` interpreter, e.g. *-received-32.js),
 * or in a whole Blob response that contains it (the script is cut out between the module separators).
 *
 *   node disassemble-vm.js <bundle.js> [output.txt] [--strings] [--no-annotate] [--names names.json] [--default-profile]
 *
 * The opcode numbers, string key and special registers differ in every build; they are derived from the interpreter in
 * the file (vm-profile.js). --default-profile uses those of site version 16504 instead.
 * Without an output file the listing is printed to stdout. --strings lists every string constant instead.
 * --names takes a JSON object mapping function labels to names, e.g. {"fn_29855": "aesCtrXor"}.
 */
const fs = require("node:fs");
const {base64ToBytes, disassemble, collectStrings, extractProgramBase64, makeProfile, DEFAULT_PROFILE} = require("../vm-disassembler/vm-disassembler");
const {carveVmChunk, extractProfile} = require("../vm-disassembler/vm-profile");

const rawArgs = process.argv.slice(2);
const namesIndex = rawArgs.indexOf("--names");
const namesFile = namesIndex >= 0 ? rawArgs[namesIndex + 1] : undefined;
const args = rawArgs.filter((a, i) => i !== namesIndex && i !== namesIndex + 1 || namesIndex < 0);
const flags = new Set(args.filter(a => a.startsWith("--")));
const [input, output] = args.filter(a => !a.startsWith("--"));
if (!input) {
    console.error("Usage: disassemble-vm.js <bundle.js> [output.txt] [--strings] [--no-annotate] [--names names.json] [--default-profile]");
    process.exit(2);
}

const source = fs.readFileSync(input, "utf8");
const chunk = carveVmChunk(source);
const [program] = extractProgramBase64(chunk);
const bytes = base64ToBytes(program);
const names = namesFile ? JSON.parse(fs.readFileSync(namesFile, "utf8")) : {};
let profile = DEFAULT_PROFILE;
if (!flags.has("--default-profile")) {
    const derived = extractProfile(chunk);
    if (derived.unknown.length || derived.missing.length) {
        console.error(`warning: ${derived.unknown.length} handlers of this build are not in known-handlers.json (${derived.unknown.map(u => "0x" + u.opcode.toString(16)).join(", ")}), ${derived.missing.length} known ones are missing (${derived.missing.join(", ")})`);
    }
    profile = makeProfile(derived);
    console.error(`profile: ${Object.keys(derived.opcodes).length} opcodes, string key 0x${derived.stringMask.toString(16)}, registers ${Object.entries(derived.registers).map(([k, v]) => `${k}=0x${v.toString(16)}`).join(" ")}`);
}
const {instructions, text} = disassemble(bytes, {annotate: !flags.has("--no-annotate"), names, profile});

let result = text;
if (flags.has("--strings")) {
    result = [...collectStrings(instructions)]
        .map(([value, offsets]) => `${JSON.stringify(value)}\t${offsets.join(",")}`)
        .join("\n") + "\n";
}
if (output) {
    fs.writeFileSync(output, result);
    console.error(`${bytes.length} bytes, ${instructions.length} instructions -> ${output}`);
} else {
    process.stdout.write(result);
}
