// Derives the build-specific parts of the register VM from its interpreter (`window.__vm`), so the disassembler
// works on every build of the bundle instead of one.
//
// Every build re-generates the interpreter: the opcode numbers, the string mask, the numbers of the special registers
// and all identifiers change. What does not change is what each opcode handler does. A handler is therefore
// recognised by a fingerprint of its normalised syntax tree (identifiers renamed by first use, property names and
// build-specific numbers blanked, string-array decoder calls and plain strings treated alike, `var a = b` aliases
// resolved) and named through KNOWN_HANDLERS. The fingerprints were taken from site version 16504 and are identical in 16520.
const crypto = require("node:crypto");
const {parse} = require("@babel/parser");
const KNOWN_HANDLERS = require("./known-handlers.json");

const CHUNK_SEPARATOR = "\x03\x06\x05\x04";   // the blob response separates the scripts of its modules with these bytes
const PROGRAM_PATTERN = /['"][A-Za-z0-9+/=]{10000,}['"]/;
const KEPT_NUMBERS = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 16, 24, 0xff, 0xffff]);   // shift widths and masks that carry meaning
const IGNORED_KEYS = new Set(["start", "end", "loc", "extra", "leadingComments", "trailingComments", "innerComments", "range"]);
const FLAG_KEYS = new Set(["operator", "prefix", "computed", "kind", "async", "generator"]);

/** The script of a bundle or blob response that holds the VM program: the text between the module separators. */
function carveVmChunk(text) {
    const program = PROGRAM_PATTERN.exec(text);
    if (!program) throw new Error("no VM program (long base64 literal) found");
    const start = text.lastIndexOf(CHUNK_SEPARATOR, program.index);
    let end = text.indexOf(CHUNK_SEPARATOR, program.index);
    if (end < 0) end = text.length;
    const chunk = text.slice(start < 0 ? 0 : start + CHUNK_SEPARATOR.length, end);
    return chunk.slice(0, chunk.lastIndexOf("})();") + 5 || chunk.length);
}

const isDecoderCall = node => node.type === "CallExpression" && node.callee.type === "Identifier"
    && node.arguments.length === 1 && node.arguments[0].type === "NumericLiteral";

/** Canonical text of a syntax tree, equal for the same handler in different builds. */
function normalise(root) {
    const aliases = new Map();
    const collect = node => {
        if (!node || typeof node !== "object") return;
        if (Array.isArray(node)) return node.forEach(collect);
        if (node.type === "VariableDeclarator" && node.id.type === "Identifier" && node.init && node.init.type === "Identifier") {
            aliases.set(node.id.name, node.init.name);
        }
        for (const key of Object.keys(node)) if (!IGNORED_KEYS.has(key)) collect(node[key]);
    };
    collect(root);
    const resolve = name => {
        for (let hops = 0; aliases.has(name) && hops < 5; hops++) name = aliases.get(name);
        return name;
    };
    const names = new Map();
    const nameOf = name => (names.has(name) || names.set(name, `v${names.size}`), names.get(name));
    const walk = node => {
        if (Array.isArray(node)) return node.map(walk).filter(part => part !== "").join(",");
        if (!node || typeof node !== "object") return JSON.stringify(node);
        switch (node.type) {
            case "Identifier": return nameOf(resolve(node.name));
            case "NumericLiteral": return KEPT_NUMBERS.has(node.value) ? `#${node.value}` : "#";
            case "StringLiteral": return `S${JSON.stringify(node.value)}`;
            case "CallExpression":
                if (isDecoderCall(node)) return `DEC(${nameOf(node.callee.name)})`;
                break;
            case "MemberExpression":
                if (node.computed && (node.property.type === "StringLiteral" || isDecoderCall(node.property))) return `(Member PROP obj:${walk(node.object)})`;
                break;
            case "VariableDeclaration": {
                const declarators = node.declarations.filter(d => !(d.id.type === "Identifier" && d.init && d.init.type === "Identifier"));
                return declarators.length ? `(Var ${declarators.map(walk).join(",")})` : "";
            }
        }
        const parts = [node.type];
        for (const key of Object.keys(node).sort()) {
            if (IGNORED_KEYS.has(key)) continue;
            if (FLAG_KEYS.has(key)) parts.push(`${key}=${node[key]}`);
            else if (node[key] && typeof node[key] === "object") parts.push(`${key}:${walk(node[key])}`);
        }
        return `(${parts.join(" ")})`;
    };
    return walk(root);
}

const fingerprint = node => crypto.createHash("sha1").update(normalise(node)).digest("hex").slice(0, 12);

/** Calls `visit` for every syntax node below (and including) `root`. */
function walkTree(root, visit) {
    if (!root || typeof root !== "object") return;
    if (Array.isArray(root)) return root.forEach(child => walkTree(child, visit));
    if (root.type) visit(root);
    for (const key of Object.keys(root)) if (!IGNORED_KEYS.has(key)) walkTree(root[key], visit);
}

const isRegister = node => node.type === "MemberExpression" && node.computed && node.property.type === "NumericLiteral";

/** Handlers of the opcode table: `table[0xNN] = function () {...}` assignments, the object with the most of them. */
function findHandlers(ast) {
    const found = [];
    walkTree(ast, node => {
        if (node.type === "AssignmentExpression" && node.left.type === "MemberExpression" && node.left.computed && node.left.property.type === "NumericLiteral"
            && node.left.object.type === "Identifier" && node.right.type === "FunctionExpression") {
            found.push({table: node.left.object.name, opcode: node.left.property.value, node: node.right});
        }
    });
    const counts = new Map();
    for (const handler of found) counts.set(handler.table, (counts.get(handler.table) || 0) + 1);
    const [table] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0] || [];
    return found.filter(handler => handler.table === table);
}

/** The special registers: PC is the register the handlers increment while reading operands, RETV the one the run loop ORs into its result, the rest are set at start-up. */
function findRegisters(ast, handlers) {
    const increments = new Map();
    for (const {node} of handlers) {
        walkTree(node, update => {
            if (update.type === "UpdateExpression" && update.operator === "++" && isRegister(update.argument)) {
                const register = update.argument.property.value;
                increments.set(register, (increments.get(register) || 0) + 1);
            }
        });
    }
    const [pc] = [...increments.entries()].sort((a, b) => b[1] - a[1])[0] || [];
    const registers = {PC: pc};
    walkTree(ast, node => {
        if (node.type === "ForStatement" && node.test && node.test.type === "BinaryExpression" && node.test.operator === "<"
            && isRegister(node.test.left) && node.test.left.property.value === pc) {
            // the run loop: for (; regs[PC] < program.length;) { ...; result = result || regs[RETV] }
            walkTree(node.body, logical => {
                if (logical.type === "LogicalExpression" && logical.operator === "||" && isRegister(logical.right) && logical.right.property.value !== pc) registers.RETV = logical.right.property.value;
            });
        }
        if (node.type === "SequenceExpression") {
            // the start-up sequence: regs[PC] = 0, regs[ZERO] = 0, regs[ONE] = 1, regs[UNDEF] = void 0, regs[THIS] = window
            const assignments = node.expressions.filter(e => e.type === "AssignmentExpression" && e.operator === "=" && isRegister(e.left));
            if (!assignments.some(a => a.left.property.value === pc && a.right.type === "NumericLiteral")
                || !assignments.some(a => a.right.type === "UnaryExpression" && a.right.operator === "void")) return;
            for (const {left, right} of assignments) {
                const register = left.property.value;
                if (register === pc) continue;
                if (right.type === "NumericLiteral" && right.value === 0) registers.ZERO = register;
                else if (right.type === "NumericLiteral" && right.value === 1) registers.ONE = register;
                else if (right.type === "UnaryExpression" && right.operator === "void") registers.UNDEF = register;
                else if (right.type === "Identifier") registers.THIS = register;
            }
        }
    });
    return registers;
}

/** The XOR key of the string constants: the number XORed with the program bytes in the string-loading handler. */
function findStringMask(handlers, known) {
    const handler = handlers.find(h => known[fingerprint(h.node)] === "STR");
    if (!handler) return undefined;
    let mask;
    walkTree(handler.node, node => {
        if (node.type === "BinaryExpression" && node.operator === "^") for (const side of [node.left, node.right]) if (side.type === "NumericLiteral") mask = side.value;
    });
    return mask;
}

/**
 * Reads the build-specific profile from the interpreter in `source` (a chunk or a whole blob response).
 * Returns {opcodes: {byte: name}, stringMask, registers: {PC, ZERO, ONE, UNDEF, THIS, RETV}, unknown: [{opcode, fingerprint}], missing: [names]}.
 */
function extractProfile(source, {known = KNOWN_HANDLERS} = {}) {
    const ast = parse(carveVmChunk(source), {sourceType: "script", allowReturnOutsideFunction: true});
    const handlers = findHandlers(ast);
    const opcodes = {};
    const unknown = [];
    for (const {opcode, node} of handlers) {
        const name = known[fingerprint(node)];
        if (name) opcodes[opcode] = name;
        else unknown.push({opcode, fingerprint: fingerprint(node)});
    }
    const missing = [...new Set(Object.values(known))].filter(name => !Object.values(opcodes).includes(name));
    return {opcodes, stringMask: findStringMask(handlers, known), registers: findRegisters(ast, handlers), unknown, missing};
}

/** Fingerprint -> name table for a build whose opcode numbers are known: used to create known-handlers.json. */
function learnKnownHandlers(source, opcodeNames) {
    const known = {};
    for (const {opcode, node} of findHandlers(parse(carveVmChunk(source), {sourceType: "script", allowReturnOutsideFunction: true}))) {
        if (opcodeNames[opcode]) known[fingerprint(node)] = opcodeNames[opcode];
    }
    return known;
}

module.exports = {KNOWN_HANDLERS, carveVmChunk, normalise, fingerprint, findHandlers, findRegisters, extractProfile, learnKnownHandlers};
