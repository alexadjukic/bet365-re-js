const {carveVmChunk, normalise, fingerprint, findHandlers, extractProfile, learnKnownHandlers, KNOWN_HANDLERS} = require("./vm-profile");
const {parse} = require("@babel/parser");
const {makeProfile, disassemble} = require("./vm-disassembler");

// A miniature interpreter in the shape of the real one. `b` holds the numbers and names that differ between builds.
const interpreter = b => `(function(){ (function(){
  var ${b.decoder} = function (i) { return ["fromCharCode"][i - 5]; };
  function ${b.boot}(program) {
    var ${b.regs}, ${b.prog}, ${b.table};
    function ${b.run}() {
      for (var result = void 0; ${b.regs}[${b.pc}] < ${b.prog}.length;) {
        var op = ${b.prog}[${b.regs}[${b.pc}]++], op = ${b.table}[op];
        try { op(); } catch (e) {}
        result = result || ${b.regs}[${b.ret}];
      }
      return result;
    }
    !(function () {
      ${b.regs} = [], ${b.prog} = [], ${b.table} = {},
      ${b.table}[${b.op.STR}] = function () {
        var dst = ${b.prog}[${b.regs}[${b.pc}]++], text = (() => {
          for (var n = ${b.prog}[${b.regs}[${b.pc}]++] << 8 | ${b.prog}[${b.regs}[${b.pc}]++], out = '', i = 0; i < n; i++)
            out += String${b.stringCall}(${b.mask} ^ ${b.prog}[${b.regs}[${b.pc}]++]);
          return out;
        })();
        ${b.regs}[dst] = text;
      },
      ${b.table}[${b.op.BYTE}] = function () {
        var dst = ${b.prog}[${b.regs}[${b.pc}]++], value = ${b.prog}[${b.regs}[${b.pc}]++];
        ${b.regs}[dst] = value;
      },
      ${b.table}[${b.op.ADD}] = function () {
        var dst = ${b.prog}[${b.regs}[${b.pc}]++], x = ${b.prog}[${b.regs}[${b.pc}]++], y = ${b.prog}[${b.regs}[${b.pc}]++], x = ${b.regs}[x], y = ${b.regs}[y];
        ${b.regs}[dst] = x + y;
      };
    })(),
    ${b.init}(program);
    function ${b.init}(source) {
      (${b.regs}[${b.pc}] = 0, ${b.regs}[${b.zero}] = 0, ${b.regs}[${b.one}] = 1, ${b.regs}[${b.undef}] = void 0, source = window, ${b.regs}[${b.self}] = source);
    }
  }
  window.__vm = ${b.boot};
})(); var program = '${"A".repeat(10000)}'; })();`;

const buildA = {decoder: "_0xa1", boot: "_0xb1", regs: "_0xr1", prog: "_0xp1", table: "_0xt1", run: "_0xrun1", init: "_0xi1", pc: "0x8d", ret: "0x85", zero: "0x84", one: "0x62", undef: "0xdb", self: "0xb2",
    mask: "0x56", stringCall: '["fromCharCode"]', op: {STR: "0x1", BYTE: "0x73", ADD: "0x5d"}};
const buildB = {decoder: "_0xa2", boot: "_0xb2", regs: "_0xr2", prog: "_0xp2", table: "_0xt2", run: "_0xrun2", init: "_0xi2", pc: "0x41", ret: "0xb2", zero: "0x81", one: "0x34", undef: "0xe0", self: "0xda",
    mask: "0x32", stringCall: "[_0xa2(0x5)]", op: {STR: "0xb4", BYTE: "0x96", ADD: "0x7"}};
const known = learnKnownHandlers(interpreter(buildA), {0x1: "STR", 0x73: "BYTE", 0x5d: "ADD"});

describe("vm-profile", () => {
    test("normalisation ignores identifiers, build numbers, and how a property is written", () => {
        const handler = source => findHandlers(parse(carveVmChunk(source), {sourceType: "script"}))[0].node;
        expect(fingerprint(handler(interpreter(buildA)))).toBe(fingerprint(handler(interpreter(buildB))));
        const alias = code => parse(`(function () { ${code} })`).program.body[0].expression;
        expect(normalise(alias("var a = b; return a + 1;"))).toBe(normalise(alias("return b + 1;")));
        expect(normalise(alias("return x.foo(1);"))).not.toBe(normalise(alias("return x.foo(1) + 1;")));
    });

    test("different handlers have different fingerprints", () => {
        expect(Object.keys(known)).toHaveLength(3);
        expect(new Set(Object.values(known))).toEqual(new Set(["STR", "BYTE", "ADD"]));
    });

    test("derives the opcode table, string key and registers of a build from its interpreter", () => {
        for (const build of [buildA, buildB]) {
            const profile = extractProfile(interpreter(build), {known});
            expect(profile.unknown).toEqual([]);
            expect(profile.missing).toEqual([]);
            expect(profile.opcodes).toEqual(Object.fromEntries(Object.entries(build.op).map(([name, byte]) => [Number(byte), name])));
            expect(profile.stringMask).toBe(Number(build.mask));
            expect(profile.registers).toEqual({PC: Number(build.pc), RETV: Number(build.ret), ZERO: Number(build.zero), ONE: Number(build.one), UNDEF: Number(build.undef), THIS: Number(build.self)});
        }
    });

    test("reports handlers it does not know", () => {
        const profile = extractProfile(interpreter(buildB), {known: {}});
        expect(profile.unknown).toHaveLength(3);
        expect(profile.opcodes).toEqual({});
    });

    test("cuts the script out of a blob response between the module separators", () => {
        const script = interpreter(buildB);
        const blob = `earlier module${"\x03\x06\x05\x04"}${script}\x03\x06\x05\x04next module`;
        expect(carveVmChunk(blob)).toBe(script);
        expect(carveVmChunk(script)).toBe(script);
        expect(() => carveVmChunk("no program here")).toThrow(/no VM program/);
    });

    test("the shipped table knows every opcode of the default profile", () => {
        expect(new Set(Object.values(KNOWN_HANDLERS)).size).toBe(39);
    });

    test("a derived profile decodes a program with that build's numbers, key and register names", () => {
        const profile = makeProfile(extractProfile(interpreter(buildB), {known}));
        const mask = Number(buildB.mask);
        const bytes = [0xb4, 0x10, 0, 2, ...[..."hi"].map(c => c.charCodeAt(0) ^ mask), 0x96, 0x11, 7, 0x7, 0x12, 0x10, 0x11];
        const {text} = disassemble(bytes, {profile});
        expect(text).toContain('r16 = "hi"');
        expect(text).toContain("r17 = 7");
        expect(text).toContain("r18 = r16 + r17");
    });
});
