const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {execFileSync, spawnSync} = require("node:child_process");
const {parseInput, templateFromCapture} = require("./generate-input");
const {TokenGenerator} = require("./token-generator");
const {decodeToken, verifyToken} = require("./token-verifier");
const {nestedFields} = require("./field-rules");

const start = 1700000000500;
const sst = Buffer.from([0, 5, 0, 1, 9, 8, 7]);
const input = (session = {}, requests = [{kind: "http", url: "/api/x?y=1", now: start + 200}]) => ({
    session: {
        headerByte: 73, sst: sst.toString("base64"), serverTime: 1700000000, start, nonce: 1234567, userAgent: "UA", timezone: "Europe/Belgrade", timezoneOffset: "-120",
        host: "www.example.com", manifestVersion: "16520", bootState: 2,
        browser: {cc: "abc", canvasA: 3, canvasB: 5, persistentId: 7, width: 100, height: 50, cores: 4, knownUsers: 1}, ...session,
    },
    requests,
});

describe("generate-input", () => {
    test("resolves the SST and keeps the values it is given", () => {
        const {session, requests, warnings} = parseInput(input());
        expect(session.sst).toEqual(sst);
        expect([session.start, session.nonce, session.serverTime, requests[0].now]).toEqual([start, 1234567, 1700000000, start + 200]);
        expect(warnings).toEqual([]);
    });

    test('"now" and "random" come from the clock and the random source, and requests default to the clock', () => {
        const {session, requests} = parseInput(input({start: "now", serverTime: "now", nonce: "random"}, [{kind: "ws", url: "/zap/?uid=1"}]), {clock: () => 1700000123456, random: () => 0.5});
        expect(session.start).toBe(1700000123456);
        expect(session.serverTime).toBe(1700000123);
        expect(session.nonce).toBe(Math.floor(0.5 * 2147483647));
        expect(requests[0].now).toBe(1700000123456);
    });

    test("rejects incomplete or inconsistent input with a message that names the field", () => {
        const bad = (session, requests, pattern) => expect(() => parseInput(input(session, requests))).toThrow(pattern);
        expect(() => parseInput({})).toThrow(/expected/);
        bad({headerByte: undefined}, undefined, /session.headerByte is missing/);
        bad({sst: Buffer.from([0, 9, 1]).toString("base64")}, undefined, /session.sst/);
        bad({nonce: 2 ** 31}, undefined, /session.nonce/);
        bad({serverTime: "yesterday"}, undefined, /session.serverTime/);
        bad({browser: {cc: "x"}}, undefined, /session.browser.canvasA is missing/);
        bad({}, [{kind: "get", url: "/a"}], /requests\[0\].kind/);
        bad({}, [{kind: "http", url: "a"}], /requests\[0\].url/);
        bad({}, [{kind: "http", url: "/a", now: start - 1}], /before session.start/);
    });

    test("warns when SERVER_TIME and the script start are far apart, and drops a loadTime that has no now", () => {
        const far = parseInput(input({serverTime: 1600000000}));
        expect(far.warnings[0]).toMatch(/session.serverTime is \d+ s away from session.start/);
        expect(far.ivWindow).toBeGreaterThan(60000);
        const {requests, warnings} = parseInput(input({}, [{kind: "http", url: "/a", loadTime: start}]), {clock: () => start + 10});
        expect(requests[0].loadTime).toBeUndefined();
        expect(warnings[0]).toMatch(/loadTime is ignored/);
    });

    test("a template made from a capture regenerates the captured tokens", () => {
        const generator = new TokenGenerator(parseInput(input()).session);
        const requests = [{kind: "http", url: "/api/a", now: start + 100, stackClass: "K", hash: "#/HO/"}, {kind: "ws", url: "/zap/?uid=1", now: start + 400, connectionId: "CONN", pending: {subscribe: "A,B"}}];
        const tokens = requests.map((r, i) => ({value: generator.next(r).value, url: `https://www.example.com${r.url}`, method: i ? "WS" : "GET", body: null, topics: i ? "A,B" : undefined, message_type: i ? 0x16 : undefined}));
        const capture = {SST_CONFIG: sst.toString("base64"), SERVER_TIME: 1700000000, tokens};
        const template = templateFromCapture(capture, 5);
        expect(template.requests).toHaveLength(2);
        const again = new TokenGenerator(parseInput(template).session);
        expect(parseInput(template).requests.map(r => again.next(r).value)).toEqual(tokens.map(t => t.value));
    });
});

describe("cli/generate-token.js", () => {
    const cli = path.join(__dirname, "../cli/generate-token.js");
    const write = (content, name = "input.json") => {
        const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "token-")), name);
        fs.writeFileSync(file, JSON.stringify(content));
        return file;
    };

    test("prints one token per request that decodes and passes the checks, counting them as one page load", () => {
        const file = write(input({}, [{kind: "http", url: "/api/a", now: start + 100}, {kind: "http", url: "/api/b", now: start + 300}, {kind: "ws", url: "/zap/?uid=1", now: start + 5300}]));
        const output = execFileSync("node", [cli, file], {encoding: "utf8"}).trim().split("\n");
        expect(output).toHaveLength(3);
        expect(output.map(t => nestedFields(decodeToken(t).fields.f).i_r)).toEqual([1, 2, 3]);
        expect(verifyToken(output[0], {}, {url: "https://www.example.com/api/a"}).checks.filter(c => !c.ok && !c.name.startsWith("header"))).toEqual([]);
    });

    test("--json prints the decoded fields and inputs made from a clock work", () => {
        const file = write(input({start: "now", serverTime: "now", nonce: "random"}, [{kind: "http", url: "/api/a"}]));
        const [line] = execFileSync("node", [cli, file, "--json"], {encoding: "utf8"}).trim().split("\n");
        const parsed = JSON.parse(line);
        expect(parsed.fields.f.i_r).toBe(1);
        expect(parsed.fields.k).toBe("www.example.com");
    });

    test("bad input exits with status 2 and says what is wrong; a failed check exits with status 1", () => {
        const bad = spawnSync("node", [cli, write({session: {}, requests: []})], {encoding: "utf8"});
        expect([bad.status, bad.stderr]).toEqual([2, expect.stringContaining("session.headerByte is missing")]);
        // a websocket request at 5 s after the HTTP one is fine; f.i_au and aa are checked, so an impossible time order is not
        const file = write(input({}, [{kind: "http", url: "/api/a", now: start + 100}, {kind: "http", url: "/api/b", now: start + 50}]));
        expect(spawnSync("node", [cli, file], {encoding: "utf8"}).status).toBe(1);
    });

    test("--template prints an input file for a capture", () => {
        const generator = new TokenGenerator(parseInput(input()).session);
        const value = generator.next({kind: "http", url: "/api/a", now: start + 100}).value;
        const capture = write({SST_CONFIG: sst.toString("base64"), SERVER_TIME: 1700000000, tokens: [{value, url: "https://www.example.com/api/a", method: "GET", body: null}]}, "session.json");
        const template = JSON.parse(execFileSync("node", [cli, "--template", capture, "1"], {encoding: "utf8"}));
        expect(template.requests).toHaveLength(1);
        expect(template.session.sst).toBe(sst.toString("base64"));
    });
});
