const {NO_ACTIVITY, isCountedUrl, activityAge, flagC, pageAge, clockSkew, iWs, iDf, appendSource, classifyStack, pubValue, nestedFields, checkFieldRules} = require("./field-rules");
const {buildToken} = require("./token-encoder");

describe("field-rules", () => {
    test("the token counter skips betbuilder, search, streaming and asset URLs", () => {
        expect(isCountedUrl("/leftnavcontentapi/allsportsmenu?lid=37")).toBe(true);
        expect(isCountedUrl("/zap/?uid=1")).toBe(true);
        expect(isCountedUrl("/betbuilderpregamecontentapi/wizard?c=1")).toBe(false);
        expect(isCountedUrl("/x/SearchAPI/y")).toBe(false);
        expect(isCountedUrl("/sports-assets/a.js")).toBe(false);
    });

    test("activity age is 1111 until a load was recorded, then whole seconds", () => {
        expect(activityAge(5000, undefined)).toBe(NO_ACTIVITY);
        expect(activityAge(15999, 5000)).toBe(10);
    });

    test("flag word C is set for any age but 0 and 1111", () => {
        expect([0, 1111, 1, 12, 22].map(flagC)).toEqual([0, 0, 1, 1, 1]);
    });

    test("page age and clock skew use whole seconds of the start time", () => {
        expect(pageAge(1790179486373 + 90300, 1790179486373)).toBe(90);
        expect(clockSkew(1790179485, 1790179486373)).toBe(-1000);
        expect(clockSkew(1790179486, 1790179486373)).toBe(0);
    });

    test("i_ws and i_df reproduce the values of the real capture", () => {
        expect(iWs(1790179486400)).toBe(0x28);
        expect(iDf({cc: "3e48088c12112d3c5cff2326804e2725e0935afe81495001a1f67a1d92095988", ca: 0xc762e3bc, cb: 0x3f44fe5f, width: 1920, height: 1080, cores: 12})).toBe(0x6604be2c);
    });

    test("f.p grows by new sources without their query string", () => {
        let list = appendSource("", "https://x.test/a.js?v=1");
        expect(list).toBe(" ~ https://x.test/a.js");
        expect(appendSource(list, "https://x.test/a.js?v=2")).toBe(list);
        expect(appendSource(list, "https://x.test/b.js")).toBe(" ~ https://x.test/a.js ~ https://x.test/b.js");
    });

    test("h depends on the stack contents, not on the browser engine", () => {
        expect(classifyStack("f@a.js\nprocessCallLaterQueue@b.js")).toBe("I");
        expect(classifyStack("f@a.js", "Apple Computer, Inc.")).toBe("I");
        expect(classifyStack("f@a.js\neval at x")).toBe("J");
        expect(classifyStack("f@a.js")).toBe("K");
    });

    test("nested integers are decoded from little-endian bytes and the rules pass on a built token", () => {
        const nested = [["i_u", 1], ["i_r", 1], ["i_tf", 0], ["i_bt", 0], ["i_ps", 7], ["i_z", 2], ["i_au", NO_ACTIVITY], ["i_pl", 0],
            ["cc", "abc"], ["i_ca", 0xc762e3bc], ["i_cb", 5], ["i_cr", 0], ["i_df", iDf({cc: "abc", ca: 0xc762e3bc, cb: 5, width: 100, height: 50, cores: 4})],
            ["i_sw", 100], ["i_sh", 50], ["i_hc", 4], ["i_vr", 157], ["i_hp", 66], ["i_kl", 231], ["i_ws", iWs(1700000000500)], ["x", "s"]];
        const start = 1700000000500;
        const token = buildToken({sst: Buffer.from([0, 1, 2]), entries: [
            ["a", "1"], ["b", 4242], ["c", ""], ["d", start + 200 + 1000 * (1700000001 - Math.floor(start / 1000))], ["e", "UA"], ["p", 0], ["g", ""], ["h", "K"],
            ["k", "h"], ["q", 0], ["r", 0], ["u", "/x"], ["v", 2], ["z", "Z"], ["ab", "s"], ["f", nested], ["aa", 0]], ivTime: start + 200});
        expect(nestedFields(require("./token-verifier").decodeToken(token).fields.f).i_ca).toBe(0xc762e3bc);
        // created 200 ms after the start (i_pl = 0), the page's SERVER_TIME one second ahead of the start time (skew +1000 ms)
        const {checks} = checkFieldRules([{value: token, url: "https://h/x"}], {serverTime: 1700000001});
        expect(checks.filter(c => !c.ok).map(c => c.name)).toEqual([]);
    });

    test("f.pub is s/u plus the pending topic lists, omitted when both are empty", () => {
        expect(pubValue("A,B", "")).toBe("sA,B");
        expect(pubValue("", "C")).toBe("uC");
        expect(pubValue("A,B", "C")).toBe("sA,B|uC");
        expect(pubValue("", "")).toBeUndefined();
    });

    test("long topic lists are kept whole (the cut to 1023 characters in the program is overwritten by RET's keep set)", () => {
        const list = Array.from({length: 400}, (_, i) => `T${i}`).join(",");
        expect(list.length).toBeGreaterThan(1023);
        expect(pubValue(list, "")).toBe(`s${list}`);
        expect(pubValue(list, list)).toBe(`s${list}|u${list}`);
    });
});
