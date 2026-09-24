const {base64ToBytes, decodeProgram, disassemble, collectStrings, extractProgramBase64} = require("./vm-disassembler");

// each string byte is XORed with 0x56
const encode = text => [...text].map(c => c.charCodeAt(0) ^ 0x56);

describe("vm-disassembler", () => {
    test("decodes strings, calls and labels", () => {
        const bytes = [
            0x01, 10, 0, 3, ...encode("foo"),      // r10 = "foo"
            0x73, 11, 7,                           // r11 = 7
            0xc6, 12, 10, 0xb2, 1, 11,             // r12 = r10.call(THIS, [r11])
            0x53, 12, 0, 0, 0, 22,                 // if (!r12) JMP 22
            0x96,                                  // HALT (offset 22)
        ];
        const {text, instructions} = disassemble(bytes);
        expect(instructions.map(i => i.name)).toEqual(["STR", "BYTE", "CALL", "JZ", "HALT"]);
        expect(text).toContain('r10 = "foo"');
        expect(text).toContain("r12 = r10.call(THIS, [r11])   ; r10=\"foo\" r11=7");
        expect(text).toContain("if (!r12) JMP L0");
        expect(text).toMatch(/L0:\n\s+22: HALT/);
    });

    test("reads big-endian 32-bit ints and doubles", () => {
        const bytes = [0xe7, 1, 0xff, 0xff, 0xff, 0xfe, 0x23, 2, 0x3f, 0xf8, 0, 0, 0, 0, 0, 0];
        const [int, double] = decodeProgram(bytes);
        expect(int.operands[1].value).toBe(-2);
        expect(double.operands[1].value).toBe(1.5);
    });

    test("collects string constants with their offsets", () => {
        const bytes = [0x01, 1, 0, 1, ...encode("a"), 0x01, 2, 0, 1, ...encode("a")];
        expect([...collectStrings(decodeProgram(bytes))]).toEqual([["a", [0, 5]]]);
    });

    test("rejects unknown opcodes and truncated programs", () => {
        expect(() => decodeProgram([0x00])).toThrow(/unknown opcode/);
        expect(() => decodeProgram([0x49, 0, 0])).toThrow(/truncated/);
    });

    test("finds the long base64 program in a bundle", () => {
        const program = Buffer.alloc(1200, 0x96).toString("base64");
        expect(extractProgramBase64(`vm("${program}");`, 1000)).toEqual([program]);
        expect(base64ToBytes(program)).toHaveLength(1200);
    });
});
