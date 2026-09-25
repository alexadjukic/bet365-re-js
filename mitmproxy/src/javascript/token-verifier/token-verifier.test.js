const {aesCtr, hash32, fnv1a32, ivFor, findIvTime, parseRecords, splitToken, verifyToken, checksumFor} = require("./token-verifier");

const record = (key, value) => {
    const raw = Buffer.isBuffer(value) ? value : Buffer.from(String(value), "latin1");
    const head = Buffer.alloc(1 + key.length + 2);
    head[0] = key.length;
    head.write(key, 1, "latin1");
    head.writeUInt16LE(raw.length, 1 + key.length);
    return Buffer.concat([head, raw]);
};
const int = (key, value, width = 4) => {
    const raw = Buffer.alloc(width);
    if (width === 8) raw.writeBigUInt64LE(BigInt(value));
    else raw.writeUIntLE(value, 0, width);
    return record(key, raw);
};

function buildToken({nonce = 1234567, now = 1700000000000, sst = Buffer.from([0, 3, 0, 1, 9]), ivByte15}) {
    const fields = {b: nonce, d: now, r: 3, q: 4096, v: 2, z: "Europe/Belgrade"};
    fields.p = checksumFor(fields);
    const plaintext = Buffer.concat([
        record("a", "1"), int("b", nonce), int("d", now, 8), record("e", "UA"),
        int("p", fields.p), int("q", 4096, 2), int("r", 3, 1), record("u", "/x?y=1"), int("v", 2, 1),
        record("z", "Europe/Belgrade"), record("k", "www.example.com"),
        record("f", Buffer.concat([record("i_u", "\x01")])),
        // padding so that the counter passes byte 15 = 255 for a high starting value
        record("y", "x".repeat(600)),
    ]);
    const iv = ivFor(now + 1000, nonce);
    if (ivByte15 !== undefined) iv[15] = ivByte15;
    const header = Buffer.from([3, 0x48, 0, 4]);
    return Buffer.concat([header, sst, iv, aesCtr(plaintext, iv)]).toString("base64");
}

describe("token-verifier", () => {
    test("fnv1a32 matches the standard test vectors", () => {
        expect(fnv1a32("")).toBe(0x811c9dc5);
        expect(fnv1a32("a")).toBe(0xe40c292c);
        expect(fnv1a32("foobar")).toBe(0xbf9cf968);
    });

    test("hash32 reproduces a checksum captured from the real VM", () => {
        expect(hash32("1746452776" + "0" + "0" + "Europe/Belgrade" + "1746452776" + "1790179485556" + "2")).toBe(2456352589);
    });

    test("IV round trip finds the time again", () => {
        const iv = ivFor(1700000001000, 1073741823);
        expect(findIvTime(iv, 1073741823, 1700000000000, 1700000002000)).toBe(1700000001000);
    });

    test("counter mode carries from byte 15 into byte 14", () => {
        const iv = Buffer.alloc(16, 0);
        iv[15] = 255;
        const data = Buffer.alloc(32);
        const stream = aesCtr(data, iv);
        const second = aesCtr(Buffer.alloc(16), Buffer.concat([Buffer.alloc(14), Buffer.from([1, 0])]));
        expect(stream.subarray(16)).toEqual(second);
    });

    test("parseRecords reports incomplete input", () => {
        expect(parseRecords(record("a", "1")).complete).toBe(true);
        expect(parseRecords(Buffer.concat([record("a", "1"), Buffer.from([5, 1])])).complete).toBe(false);
    });

    test("a well-formed token passes every check, also across the counter carry", () => {
        for (const ivByte15 of [0, 250]) {
            const token = buildToken({ivByte15});
            const {checks} = verifyToken(token, {}, {url: "https://www.example.com/x?y=1"});
            // forcing byte 15 of the IV makes it differ from the FNV construction, so that check is expected to fail
            expect(checks.filter(c => !c.ok).map(c => c.name)).toEqual(["IV matches FNV(nonce b, time)"]);
        }
    });

    test("an untouched IV passes the IV check", () => {
        const {checks} = verifyToken(buildToken({}), {}, {url: "https://www.example.com/x?y=1"});
        expect(checks.filter(c => !c.ok)).toEqual([]);
    });

    test("splitToken uses the length prefix to find the IV", () => {
        const token = buildToken({sst: Buffer.from([0, 5, 1, 2, 3, 4, 5])});
        expect(splitToken(token).sst).toEqual(Buffer.from([1, 2, 3, 4, 5]));
    });

    test("a tampered field breaks the checksum", () => {
        const token = Buffer.from(buildToken({}), "base64");
        const {decoded} = verifyToken(token);
        expect(decoded.fields.p).toBe(checksumFor(decoded.fields));
        expect(checksumFor({...decoded.fields, r: 4})).not.toBe(decoded.fields.p);
    });
});
