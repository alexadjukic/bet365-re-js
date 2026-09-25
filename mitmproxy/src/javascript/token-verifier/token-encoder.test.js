const {minimalWidth, encodeInt, encodeRecord, encodeRecords, encodeNested, assembleToken, buildToken, toBuildInput} = require("./token-encoder");
const {decodeToken, parseRecords, verifyToken, ivFor, base64ToBuffer} = require("./token-verifier");

const sst = Buffer.from([0, 1, 9, 8, 7]);
const entries = () => [
    ["a", "1"], ["b", 1234567], ["c", "#/HO/"], ["d", 1700000000000], ["e", "UA"], ["p", 0], ["g", ""], ["h", "K"],
    ["k", "www.example.com"], ["q", 0], ["r", 0], ["u", "/x?y=1"], ["v", 2], ["z", "Europe/Belgrade"],
    ["f", [["i_u", 1], ["i_r", 3], ["i_ps", 0x2c848328], ["ul", "/x?y=1"], ["i_sw", 1920], ["i_ca", 0xc762e3bc], ["p", " ~ x"]]],
    ["aa", 0],
];

describe("token-encoder", () => {
    test("integer width follows the VM: 1, 2, 4 bytes, 8 bytes above the signed 32-bit maximum", () => {
        expect([0, 255, 256, 65535, 65536, 2 ** 31 - 1, 2 ** 31, 1790179485556].map(minimalWidth)).toEqual([1, 1, 2, 2, 4, 4, 8, 8]);
        expect(encodeInt(0x3fffffff)).toEqual(Buffer.from([0xff, 0xff, 0xff, 0x3f]));
    });

    test("record encoding matches the documented example (b = 0x3FFFFFFF)", () => {
        expect(encodeRecord("b", encodeInt(0x3fffffff))).toEqual(Buffer.from("016204 00ffffff3f".replace(" ", ""), "hex"));
        expect(encodeRecord("a", Buffer.from("1"))).toEqual(Buffer.from("0161010031", "hex"));
    });

    test("encodeRecords output parses back to the same values", () => {
        const {records, complete} = parseRecords(encodeRecords([["a", "1"], ["b", 7], ["d", 1700000000000]]));
        expect(complete).toBe(true);
        expect(records.map(r => [r.key, r.value])).toEqual([["a", "1"], ["b", 7], ["d", 1700000000000]]);
    });

    test("a built token decodes and passes the verifier, with p and IV derived", () => {
        const token = buildToken({entries: entries(), sst});
        const {checks} = verifyToken(token, {}, {url: "https://www.example.com/x?y=1"});
        expect(checks.filter(c => !c.ok)).toEqual([]);
        const decoded = decodeToken(token);
        expect(decoded.iv).toEqual(ivFor(1700000000000 + 1000, 1234567));
        expect(decoded.sst).toEqual(sst);
    });

    test("decoding then re-encoding reproduces the token exactly", () => {
        const token = buildToken({entries: entries(), sst});
        expect(buildToken(toBuildInput(token))).toBe(base64ToBuffer(token).toString("base64"));
        expect(buildToken({...toBuildInput(token), keepChecksum: true, iv: decodeToken(token).iv})).toBe(token);
    });

    test("assembleToken keeps the given IV and SST length prefix", () => {
        const iv = Buffer.alloc(16, 7);
        const bytes = base64ToBuffer(assembleToken({sst, iv, plaintext: encodeRecords([["a", "1"]])}));
        expect(bytes.subarray(0, 6)).toEqual(Buffer.from([3, 0x48, 0, 4, 0, 5]));
        expect(bytes.subarray(6 + 5, 6 + 5 + 16)).toEqual(iv);
    });

    test("nested block uses the integer keys of f", () => {
        expect(encodeNested([["i_sw", 1920], ["ua", "x"]])).toEqual(Buffer.concat([encodeRecord("i_sw", Buffer.from([0x80, 0x07])), encodeRecord("ua", Buffer.from("x"))]));
    });
});
