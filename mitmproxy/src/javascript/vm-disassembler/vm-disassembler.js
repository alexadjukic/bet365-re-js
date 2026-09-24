// Disassembler for the register VM embedded in bet365's "ns_gen5_search"/__vm bundle
// (data/deobfuscated/*-received-32.js).
//
// The bundle ships a tiny interpreter (`window.__vm`) plus one huge base64 string that is its program.
// Interpreter facts (taken from its opcode handler table):
//   * registers live in one array; a few are special (see SPECIAL_REGISTERS)
//   * the program is a byte array (atob of the base64), operands are single bytes unless noted
//   * 32-bit operands are big-endian; strings are 16-bit big-endian length + bytes XOR 0x56
//   * every opcode has a fixed layout, so a linear sweep from offset 0 decodes the whole program
const {parse} = require("@babel/parser");
const traverse = require("@babel/traverse").default;

const STRING_XOR_KEY = 0x56;

// Registers the interpreter itself initialises / uses.
const SPECIAL_REGISTERS = {
    0x8d: "PC",     // instruction pointer
    0x84: "ZERO",   // initialised to 0
    0x62: "ONE",    // initialised to 1
    0xdb: "UNDEF",  // initialised to undefined
    0xb2: "THIS",   // `window` at start, the receiver inside a MAKEFN function
    0x85: "RETV",   // return-value slot of a MAKEFN function
};

const reg = n => SPECIAL_REGISTERS[n] || `r${n}`;

// Operand kinds: r=register, b=byte immediate, w=32-bit signed immediate, a=32-bit code address,
// s=string, d=double, regs/bytes=count byte followed by that many bytes.
const BINARY = (name, symbol) => ({name, symbol, layout: ["r", "r", "r"], writes: 0, kind: "binary"});

const OPCODES = {
    0x01: {name: "STR", layout: ["r", "s"], writes: 0},
    0x73: {name: "BYTE", layout: ["r", "b"], writes: 0},
    0xe7: {name: "INT", layout: ["r", "w"], writes: 0},
    0x23: {name: "DOUBLE", layout: ["r", "d"], writes: 0},
    0x9a: {name: "ARRAY", layout: ["r", "regs"], writes: 0},
    0x90: {name: "MOV", layout: ["r", "r"], writes: 0},
    0xac: {name: "GETPROP", layout: ["r", "r", "r"], writes: 0},
    0x38: {name: "SETPROP", layout: ["r", "r", "r"]},
    0xc6: {name: "CALL", layout: ["r", "r", "r", "regs"], writes: 0},   // dst, fn, this, args
    0x50: {name: "NEW", layout: ["r", "r", "regs"], writes: 0},         // dst, ctor, args
    0xc2: {name: "EVAL", layout: ["r", "r"], writes: 0},                // dst, source
    0x19: {name: "THROW", layout: ["r"]},
    0x96: {name: "HALT", layout: []},
    0x49: {name: "JMP", layout: ["a"]},
    0xed: {name: "JNZ", layout: ["r", "a"]},
    0x53: {name: "JZ", layout: ["r", "a"]},
    // dst, address of the function body, parameter registers
    0x43: {name: "MAKEFN", layout: ["r", "a", "bytes"], writes: 0},
    // address, register receiving the return value, (callee register, caller register) pairs
    0xbc: {name: "CALLLOCAL", layout: ["a", "b", "bytes"]},
    // register holding the return value, registers copied back to the caller
    0x37: {name: "RET", layout: ["r", "bytes"]},
    // catch register, catch address, finally address, end address
    0xa9: {name: "TRY", layout: ["r", "a", "a", "a"]},
    0xe4: BINARY("EQ", "=="),
    0xfe: BINARY("NEQ", "!="),
    0xff: BINARY("SEQ", "==="),
    0x24: BINARY("SNEQ", "!=="),
    0x4d: BINARY("LT", "<"),
    0xf4: BINARY("GT", ">"),
    0x54: BINARY("LE", "<="),
    0x09: BINARY("GE", ">="),
    0x5d: BINARY("ADD", "+"),
    0x42: BINARY("SUB", "-"),
    0xa1: BINARY("MUL", "*"),
    0x15: BINARY("DIV", "/"),
    0xeb: BINARY("MOD", "%"),
    0xcc: BINARY("AND", "&"),
    0xdc: BINARY("OR", "|"),
    0xf7: BINARY("XOR", "^"),
    0xf8: BINARY("SHL", "<<"),
    0x9c: BINARY("SHR", ">>"),
    0x1a: BINARY("USHR", ">>>"),
};

function base64ToBytes(base64) {
    return Array.from(Buffer.from(base64, "base64"));
}

// Reads the operands of one instruction. Throws on an unknown opcode or a truncated program.
function decodeInstruction(bytes, offset) {
    const opcode = bytes[offset];
    const spec = OPCODES[opcode];
    if (!spec) {
        throw new Error(`unknown opcode 0x${opcode.toString(16)} at offset ${offset}`);
    }
    let cursor = offset + 1;
    const need = count => {
        if (cursor + count > bytes.length) {
            throw new Error(`program truncated inside ${spec.name} at offset ${offset}`);
        }
    };
    const u8 = () => (need(1), bytes[cursor++]);
    const u32 = () => (need(4), ((bytes[cursor++] << 24) | (bytes[cursor++] << 16) | (bytes[cursor++] << 8) | bytes[cursor++]) >>> 0);
    const operands = [];
    for (const kind of spec.layout) {
        switch (kind) {
            case "r": operands.push({kind: "r", value: u8()}); break;
            case "b": operands.push({kind: "b", value: u8()}); break;
            case "w": operands.push({kind: "w", value: u32() | 0}); break;
            case "a": operands.push({kind: "a", value: u32()}); break;
            case "s": {
                need(2);
                const length = (bytes[cursor++] << 8) | bytes[cursor++];
                need(length);
                let text = "";
                for (let i = 0; i < length; i++) text += String.fromCharCode(STRING_XOR_KEY ^ bytes[cursor++]);
                operands.push({kind: "s", value: text});
                break;
            }
            case "d": {
                need(8);
                const view = new DataView(new Uint8Array(bytes.slice(cursor, cursor + 8)).buffer);
                cursor += 8;
                operands.push({kind: "d", value: view.getFloat64(0)});
                break;
            }
            case "regs":
            case "bytes": {
                const count = u8();
                operands.push({kind, value: Array.from({length: count}, u8)});
                break;
            }
            default:
                throw new Error(`bad layout kind ${kind}`);
        }
    }
    return {offset, opcode, name: spec.name, spec, operands, size: cursor - offset};
}

// Linear sweep over the whole program.
function decodeProgram(bytes) {
    const instructions = [];
    let offset = 0;
    while (offset < bytes.length) {
        const instruction = decodeInstruction(bytes, offset);
        instructions.push(instruction);
        offset += instruction.size;
    }
    return instructions;
}

const addressOperands = instruction => instruction.operands.filter(o => o.kind === "a").map(o => o.value);

// Addresses that something jumps to or starts executing at (used for labels).
function collectLabels(instructions) {
    const labels = new Map();
    const functionEntries = new Set();
    for (const instruction of instructions) {
        for (const address of addressOperands(instruction)) {
            labels.set(address, null);
            if (instruction.name === "MAKEFN" || instruction.name === "CALLLOCAL") functionEntries.add(address);
        }
    }
    let branch = 0;
    for (const address of [...labels.keys()].sort((a, b) => a - b)) {
        labels.set(address, functionEntries.has(address) ? `fn_${address}` : `L${branch++}`);
    }
    return labels;
}

const quote = value => JSON.stringify(value);
const formatConstant = value => (typeof value === "string" ? quote(value) : String(value));

// Renders one instruction, e.g. `r10 = r5[r6]` or `r9 = r7.call(r8, [r4])`.
function renderInstruction(instruction, labels) {
    const label = address => labels.get(address) || `@${address}`;
    const list = registers => `[${registers.map(reg).join(", ")}]`;
    const [a, b, c, d] = instruction.operands;
    switch (instruction.name) {
        case "STR": return `${reg(a.value)} = ${quote(b.value)}`;
        case "BYTE":
        case "INT":
        case "DOUBLE": return `${reg(a.value)} = ${b.value}`;
        case "ARRAY": return `${reg(a.value)} = ${list(b.value)}`;
        case "MOV": return `${reg(a.value)} = ${reg(b.value)}`;
        case "GETPROP": return `${reg(a.value)} = ${reg(b.value)}[${reg(c.value)}]`;
        case "SETPROP": return `${reg(a.value)}[${reg(b.value)}] = ${reg(c.value)}`;
        case "CALL": return `${reg(a.value)} = ${reg(b.value)}.call(${reg(c.value)}, ${list(d.value)})`;
        case "NEW": return `${reg(a.value)} = new ${reg(b.value)}(${c.value.map(reg).join(", ")})`;
        case "EVAL": return `${reg(a.value)} = eval(${reg(b.value)})`;
        case "THROW": return `throw ${reg(a.value)}`;
        case "HALT": return "HALT";
        case "JMP": return `JMP ${label(a.value)}`;
        case "JNZ": return `if (${reg(a.value)}) JMP ${label(b.value)}`;
        case "JZ": return `if (!${reg(a.value)}) JMP ${label(b.value)}`;
        case "MAKEFN": return `${reg(a.value)} = function ${label(b.value)}(params=${list(c.value)})`;
        case "CALLLOCAL": {
            const pairs = [];
            for (let i = 0; i + 1 < c.value.length; i += 2) pairs.push(`${reg(c.value[i])}<-${reg(c.value[i + 1])}`);
            return `${reg(b.value)} = ${label(a.value)}(${pairs.join(", ")})`;
        }
        case "RET": return `RET ${reg(a.value)} keep=${list(b.value)}`;
        case "TRY": return `TRY catch ${reg(a.value)} -> ${label(b.value)}, finally -> ${label(c.value)}, end -> ${label(d.value)}`;
        default:
            if (instruction.spec.kind === "binary") {
                return `${reg(a.value)} = ${reg(b.value)} ${instruction.spec.symbol} ${reg(c.value)}`;
            }
            return instruction.name;
    }
}

const CONSTANT_LOADS = new Set(["STR", "BYTE", "INT", "DOUBLE"]);

// Registers written by an instruction (used for the constant annotations).
function writtenRegisters(instruction) {
    if (instruction.spec.writes === 0) return [instruction.operands[0].value];
    if (instruction.name === "CALLLOCAL") return [instruction.operands[1].value];
    return [];
}

// Human readable listing. `annotate` adds `; rN=<constant>` hints from constants loaded earlier in the
// same straight-line run (reset at every label / function boundary).
function disassemble(bytes, {annotate = true} = {}) {
    const instructions = decodeProgram(bytes);
    const labels = collectLabels(instructions);
    const lines = [];
    let known = new Map();
    for (const instruction of instructions) {
        if (labels.has(instruction.offset)) {
            known = new Map();
            lines.push(`${labels.get(instruction.offset)}:`);
        }
        const text = renderInstruction(instruction, labels);
        let note = "";
        if (annotate && !CONSTANT_LOADS.has(instruction.name)) {
            const used = new Set();
            for (const operand of instruction.operands) {
                if (operand.kind === "r") used.add(operand.value);
                if (operand.kind === "regs") operand.value.forEach(r => used.add(r));
            }
            const hints = [...used].filter(r => known.has(r)).map(r => `${reg(r)}=${formatConstant(known.get(r))}`);
            if (hints.length) note = `   ; ${hints.join(" ")}`;
        }
        lines.push(`  ${String(instruction.offset).padStart(6)}: ${text}${note}`);

        if (CONSTANT_LOADS.has(instruction.name)) {
            known.set(instruction.operands[0].value, instruction.operands[1].value);
        } else if (instruction.name === "MOV" && known.has(instruction.operands[1].value)) {
            known.set(instruction.operands[0].value, known.get(instruction.operands[1].value));
        } else if (["CALLLOCAL", "RET", "TRY", "MAKEFN"].includes(instruction.name)) {
            known = new Map();
        } else {
            for (const written of writtenRegisters(instruction)) known.delete(written);
        }
    }
    return {instructions, labels, text: lines.join("\n") + "\n"};
}

// Every string constant in the program with the offsets that load it.
function collectStrings(instructions) {
    const strings = new Map();
    for (const instruction of instructions) {
        if (instruction.name !== "STR") continue;
        const value = instruction.operands[1].value;
        if (!strings.has(value)) strings.set(value, []);
        strings.get(value).push(instruction.offset);
    }
    return strings;
}

// Finds the base64 program(s) in an obfuscated/deobfuscated bundle: string literals that are very long and
// pure base64 (a call argument once the string array is inlined, an array element before that).
function extractProgramBase64(source, minLength = 1000) {
    const ast = parse(source, {sourceType: "script", allowReturnOutsideFunction: true});
    const candidates = [];
    traverse(ast, {
        StringLiteral(path) {
            const {value} = path.node;
            if (value.length >= minLength && /^[A-Za-z0-9+/=]+$/.test(value) && !candidates.includes(value)) {
                candidates.push(value);
            }
        },
    });
    if (candidates.length === 0) {
        throw new Error("no base64 VM program found");
    }
    return candidates;
}

module.exports = {
    OPCODES,
    SPECIAL_REGISTERS,
    base64ToBytes,
    decodeInstruction,
    decodeProgram,
    collectLabels,
    disassemble,
    collectStrings,
    extractProgramBase64,
};
