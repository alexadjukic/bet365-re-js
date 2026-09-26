const fs = require("node:fs");
const path = require("node:path");
const {TokenGenerator, SESSION_INPUTS, REQUEST_INPUTS} = require("./token-generator");
const {decodeToken, verifyToken, fnv1a32} = require("./token-verifier");
const {nestedFields, checkFieldRules} = require("./field-rules");
const {inputsFromCapture} = require("./capture-inputs");

const start = 1700000000500;
const session = (overrides = {}) => ({
    headerByte: 73, sst: Buffer.from([0, 5, 0, 1, 9, 8, 7]), serverTime: 1700000001, start, nonce: 1234567, userAgent: "UA", timezone: "Europe/Belgrade", timezoneOffset: "-120",
    host: "www.example.com", manifestVersion: "16520", bootState: 2, sessionId: "SESSION", currencyRate: "136.5", countryId: "240",
    browser: {cc: "abc", canvasA: 0xc762e3bc, canvasB: 5, canvasRandomised: false, persistentId: 7, width: 100, height: 50, cores: 4, knownUsers: 1},
    ...overrides,
});
const request = (overrides = {}) => ({now: start + 200, kind: "http", url: "/api/x?y=1", hash: "#/HO/", stackClass: "K", ...overrides});
const recordsOf = token => decodeToken(token).records.map(r => r.key);

describe("token-generator", () => {
    test("a generated token decodes, passes the verifier and puts the records in the order of the code", () => {
        const {value} = new TokenGenerator(session()).next(request());
        const {checks} = verifyToken(value, {userAgent: "UA", timezone: "Europe/Belgrade"}, {url: "https://www.example.com/api/x?y=1"});
        expect(checks.filter(c => !c.ok && c.name !== "header is 03 48 00 04")).toEqual([]);
        expect(recordsOf(value)).toEqual(["a", "b", "c", "d", "e", "p", "g", "h", "j", "k", "o", "q", "r", "s", "t", "u", "v", "x", "z", "ab", "f", "aa"]);
        const nested = nestedFields(decodeToken(value).fields.f);
        expect(Object.keys(nested).slice(0, 4)).toEqual(["i_u", "i_r", "i_tf", "i_bt"]);
        expect(nested.i_df).toBe(fnv1a32(`abc${0xc762e3bc}5100x504`));
    });

    test("the header carries the build number and the token time is in the IV", () => {
        const a = decodeToken(new TokenGenerator(session({headerByte: 72})).next(request()).value);
        expect(a.header.toString("hex")).toBe("03480004");
        const b = decodeToken(new TokenGenerator(session()).next(request()).value);
        expect(b.header.toString("hex")).toBe("03490004");
        expect(b.fields.d).toBe(start + 200 + clockSkew());
    });

    test("f.i_r counts every token except the uncounted URLs, and f.i_au follows the last HTTP load", () => {
        const generator = new TokenGenerator(session());
        const field = (result, key) => nestedFields(decodeToken(result.value).fields.f)[key];
        const first = generator.next(request({now: start + 100}));
        const socket = generator.next(request({now: start + 200, kind: "ws", url: "/zap/?uid=1"}));
        const second = generator.next(request({now: start + 300}));
        const betbuilder = generator.next(request({now: start + 400, url: "/betbuilderpregamecontentapi/wizard?c=1"}));
        const later = generator.next(request({now: start + 15400, kind: "ws", url: "/zap/?uid=1"}));
        expect([first, socket, second, betbuilder, later].map(r => field(r, "i_r"))).toEqual([1, 2, 3, 3, 4]);
        expect([first, socket, second, betbuilder, later].map(r => field(r, "i_au"))).toEqual([1111, 1111, 0, 0, 15]);
        expect([first, later].map(r => decodeToken(r.value).fields.aa)).toEqual([0, 1]);
    });

    test("optional fields appear only when there is something to say", () => {
        const plain = new TokenGenerator(session({currencyRate: undefined, countryId: undefined, sessionId: undefined})).next(request({stackClass: undefined}));
        expect(recordsOf(plain.value)).not.toEqual(expect.arrayContaining(["h", "i", "j", "o", "s", "w"]));
        const rich = new TokenGenerator(session()).next(request({ips: "1.2.3.4", body: "id=1", scripts: " ~ https://x/a.js", clicks: 3}));
        expect(recordsOf(rich.value)).toEqual(expect.arrayContaining(["i", "w"]));
        const decoded = decodeToken(rich.value);
        expect(decoded.fields.w).toBe(fnv1a32("id=1"));
        const nested = nestedFields(decoded.fields.f);
        expect(nested.p).toBe(" ~ https://x/a.js");
        expect(nested.i_cl).toBe(3);
    });

    test("f.pub exists from build 73 on, for websocket URLs with a pending batch", () => {
        const socket = {kind: "ws", url: "/zap/?uid=1", pending: {subscribe: "A,B", unsubscribe: ""}};
        expect(nestedFields(decodeToken(new TokenGenerator(session()).next(request(socket)).value).fields.f).pub).toBe("sA,B");
        expect(nestedFields(decodeToken(new TokenGenerator(session({headerByte: 72})).next(request(socket)).value).fields.f).pub).toBeUndefined();
        expect(nestedFields(decodeToken(new TokenGenerator(session()).next(request({...socket, pending: {}})).value).fields.f).pub).toBeUndefined();
        expect(nestedFields(decodeToken(new TokenGenerator(session()).next(request({pending: {subscribe: "A"}})).value).fields.f).pub).toBeUndefined();   // HTTP
    });

    test("the field rules accept generated tokens", () => {
        const generator = new TokenGenerator(session());
        const tokens = [start + 100, start + 250, start + 900].map((now, i) => ({value: generator.next(request({now, url: `/api/${i}`})).value, url: `https://www.example.com/api/${i}`}));
        const {checks} = checkFieldRules(tokens, {serverTime: 1700000001});
        expect(checks.filter(c => !c.ok)).toEqual([]);
    });

    test("every input is documented", () => {
        expect(Object.keys(SESSION_INPUTS)).toEqual(expect.arrayContaining(["sst", "start", "nonce", "browser"]));
        expect(Object.keys(REQUEST_INPUTS)).toEqual(expect.arrayContaining(["now", "url", "loadTime", "pending"]));
    });
});

describe("flag and click rules", () => {
    const build = flagsAndClicks => {
        const generator = new TokenGenerator(session());
        return flagsAndClicks.map(([flags, clicks], i) => ({value: generator.next(request({now: start + 100 + i * 50, url: `/api/${i}`, flags: {r: flags, q: 0}, clicks})).value, url: `https://www.example.com/api/${i}`}));
    };
    const failures = tokens => checkFieldRules(tokens, {serverTime: 1700000001}).checks.filter(c => !c.ok).map(c => c.name);

    test("A20 stays set and the click counter only counts up", () => {
        expect(failures(build([[0, 0], [0, 2], [1 << 20, 3], [1 << 20, 3], [1 << 20, 5]]))).toEqual([]);
    });

    test("a flag bit that is not cleared on purpose cannot disappear, and the click counter cannot fall", () => {
        expect(failures(build([[1 << 20, 3], [0, 3]]))).toEqual([expect.stringContaining("flag word A never loses a bit")]);
        expect(failures(build([[0, 5], [0, 4]]))).toEqual(["f.i_cl (click counter) never decreases"]);
        expect(failures(build([[1 << 6, 0], [0, 0]]))).toEqual([]);   // A6 is cleared on purpose
    });
});

// the skew of `d` for these inputs: 1000 * (serverTime - whole seconds of the start time)
function clockSkew() {
    return 1000 * (1700000001 - Math.floor(start / 1000));
}

// with the real captures (gitignored) every captured token must be regenerated byte for byte
const captures = ["session.json", "session2.json", "session3.json"].map(name => path.join(__dirname, "../../../../data/captures", name));
describe.each(captures.filter(fs.existsSync))("regenerating the tokens of %s", file => {
    test("every token is reproduced byte for byte", () => {
        const {session: inputs, requests, rows} = inputsFromCapture(JSON.parse(fs.readFileSync(file, "utf8")));
        const generator = new TokenGenerator(inputs);
        const regenerated = requests.map(r => generator.next(r).value);
        const captured = rows.map(r => Buffer.from(r.token.value, "base64").toString("base64"));
        expect(regenerated).toEqual(captured);
    });
});
