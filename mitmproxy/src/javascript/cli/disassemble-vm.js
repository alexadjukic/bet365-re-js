#!/usr/bin/env node
/**
 * Disassemble the bytecode program embedded in a VM-protected bundle (the `__vm` interpreter, e.g. *-received-32.js).
 *
 *   node disassemble-vm.js <bundle.js> [output.txt] [--strings] [--no-annotate]
 *
 * Without an output file the listing is printed to stdout. --strings lists every string constant instead.
 */
const fs = require("node:fs");
const {base64ToBytes, disassemble, collectStrings, extractProgramBase64} = require("../vm-disassembler/vm-disassembler");

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith("--")));
const [input, output] = args.filter(a => !a.startsWith("--"));
if (!input) {
    console.error("Usage: disassemble-vm.js <bundle.js> [output.txt] [--strings] [--no-annotate]");
    process.exit(2);
}

const [program] = extractProgramBase64(fs.readFileSync(input, "utf8"));
const bytes = base64ToBytes(program);
const {instructions, text} = disassemble(bytes, {annotate: !flags.has("--no-annotate")});

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
