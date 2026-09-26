// Compares the programs of two builds of the VM bundle. The compiler that made the program is deterministic, so a
// function that did not change has the same sequence of instructions and constants in every build even though the
// addresses (and the opcode numbers, which the profile takes care of) differ. Registers are not part of the signature.
const crypto = require("node:crypto");

const CONSTANT_LOADS = new Set(["STR", "INT", "BYTE", "DOUBLE"]);

/** Instructions whose address operand is not the start of an instruction (should be 0 for a correctly decoded program). */
function badJumpTargets(instructions) {
    const starts = new Set(instructions.map(i => i.offset));
    return instructions.flatMap(i => i.operands.filter(o => o.kind === "a" && !starts.has(o.value)).map(o => ({from: i.offset, to: o.value})));
}

/** Splits a program into functions: the code before the first function body, then every MAKEFN / CALLLOCAL target up to the next one. */
function splitFunctions(instructions) {
    const entries = new Set([0]);
    for (const instruction of instructions) {
        if (instruction.name === "MAKEFN" || instruction.name === "CALLLOCAL") {
            entries.add(instruction.operands.find(o => o.kind === "a").value);
        }
    }
    const addresses = [...entries].sort((a, b) => a - b);
    return addresses.map((address, index) => {
        const end = addresses[index + 1] ?? Infinity;
        const body = instructions.filter(i => i.offset >= address && i.offset < end);
        const constants = body.filter(i => CONSTANT_LOADS.has(i.name)).map(i => i.operands[1].value);
        const text = body.map(i => (CONSTANT_LOADS.has(i.name) ? `${i.name}:${i.operands[1].value}` : i.name)).join("|");
        return {address, instructions: body, constants, signature: crypto.createHash("sha1").update(text).digest("hex").slice(0, 12)};
    });
}

/** Matches the functions of two programs by signature (functions with equal signatures are paired in address order). */
function compareFunctions(functionsA, functionsB) {
    const pending = new Map();
    for (const fn of functionsB) (pending.get(fn.signature) || pending.set(fn.signature, []).get(fn.signature)).push(fn);
    const matched = [];
    const onlyA = [];
    for (const fn of functionsA) {
        const candidates = pending.get(fn.signature);
        if (candidates && candidates.length) matched.push({a: fn, b: candidates.shift()});
        else onlyA.push(fn);
    }
    const onlyB = [...pending.values()].flat().sort((x, y) => x.address - y.address);
    return {matched, onlyA, onlyB};
}

/** Function names of build A (`{fn_<address>: name}`) carried over to the matching functions of build B. */
function transferNames(matched, names) {
    const carried = {};
    for (const {a, b} of matched) if (names[`fn_${a.address}`]) carried[`fn_${b.address}`] = names[`fn_${a.address}`];
    return carried;
}

module.exports = {badJumpTargets, splitFunctions, compareFunctions, transferNames};
