const {badJumpTargets, splitFunctions, compareFunctions, transferNames} = require("./vm-compare");
const {decodeProgram} = require("./vm-disassembler");

const encode = text => [...text].map(c => c.charCodeAt(0) ^ 0x56);
// r1 = function fn_<address>(); the function body loads "x" and returns; then a call to it
const program = ({constant, padding = []}) => {
    const body = [0x01, 2, 0, constant.length, ...encode(constant), 0x37, 2, 0];   // r2 = "<constant>"; RET r2
    const main = [0x43, 1, 0, 0, 0, 0, 0, ...padding, 0x96];                          // r1 = function fn_?(); HALT (the address is patched below)
    const address = main.length;
    main[5] = address;
    return [...main, ...body];
};

describe("vm-compare", () => {
    test("splits a program into the main code and its function bodies", () => {
        const functions = splitFunctions(decodeProgram(program({constant: "x"})));
        expect(functions.map(f => f.address)).toEqual([0, 8]);
        expect(functions[1].constants).toEqual(["x"]);
    });

    test("functions with the same instructions and constants match although they moved", () => {
        const a = splitFunctions(decodeProgram(program({constant: "x"})));
        const b = splitFunctions(decodeProgram(program({constant: "x", padding: [0x96, 0x96]})));
        const {matched, onlyA, onlyB} = compareFunctions(a, b);
        expect(onlyA.map(f => f.address)).toEqual([0]);   // the main code changed (two more HALTs)
        expect(onlyB.map(f => f.address)).toEqual([0]);
        expect(matched.find(m => m.a.address === 8).b.address).toBe(10);
    });

    test("a changed constant makes the function differ, and names are carried over for the rest", () => {
        const a = splitFunctions(decodeProgram(program({constant: "x"})));
        const b = splitFunctions(decodeProgram(program({constant: "y"})));
        const {matched, onlyA, onlyB} = compareFunctions(a, b);
        expect(matched.map(m => m.a.address)).toEqual([0]);
        expect(onlyA.map(f => f.address)).toEqual([8]);
        expect(onlyB.map(f => f.address)).toEqual([8]);
        expect(transferNames(matched, {fn_0: "main", fn_8: "body"})).toEqual({fn_0: "main"});
    });

    test("finds jump targets that are not instruction starts", () => {
        expect(badJumpTargets(decodeProgram(program({constant: "x"})))).toEqual([]);
        const broken = decodeProgram([0x49, 0, 0, 0, 3, 0x96]);   // JMP 3 lands inside the JMP
        expect(badJumpTargets(broken)).toEqual([{from: 0, to: 3}]);
    });
});
