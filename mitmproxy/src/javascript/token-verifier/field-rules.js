/**
 * Rules for the plaintext fields of an X-Net-Sync-Term token that are not constants, read from the VM program
 * of received-32.js (fn_31070 for the nested block `f`, fn_34129 for the outer fields) and checked against real tokens.
 * Times are milliseconds since the epoch unless stated otherwise.
 */
const {decodeToken, parseNested, fnv1a32, findIvTime} = require("./token-verifier");
const {NESTED_INT_KEYS} = require("./token-encoder");

/** Value of f.i_au before the first `Loader.load` call was seen by the hook (r63 undefined). */
const NO_ACTIVITY = 1111;

/** URLs containing one of these do not advance the token counter f.i_r (fn_44705, checked on the lower-cased URL). */
const UNCOUNTED_URL_PARTS = ["betbuilder", "searchapi", "streamingapi", "streamingmonitor", "/sports-assets/"];

/** f.i_r: the counter is incremented once per token, except for the URLs above (which repeat the previous value). */
function isCountedUrl(url) {
    const lower = url.toLowerCase();
    return !UNCOUNTED_URL_PARTS.some(part => lower.includes(part));
}

/** f.i_au: whole seconds since the last `Loader.load` call recorded by the hook, or 1111 when none was recorded yet. */
function activityAge(now, lastLoad) {
    return lastLoad === undefined ? NO_ACTIVITY : Math.floor((now - lastLoad) / 1000);
}

/** Flag word C (`aa`): bit 0 is set when f.i_au is neither 0 nor 1111. The word is reset to 0 for every token. */
function flagC(iAu) {
    return iAu !== 0 && iAu !== NO_ACTIVITY ? 1 : 0;
}

/** f.i_pl: whole seconds since the script started (r14 = Date.now() at load). */
function pageAge(now, start) {
    return Math.floor((now - start) / 1000);
}

/** Clock skew added to Date.now() to get `d`: 1000 * (SERVER_TIME - whole seconds of the script start time). */
function clockSkew(serverTime, start) {
    return 1000 * (serverTime - Math.floor(start / 1000));
}

/** f.i_ws: a 3-day bucket of the script start time, scrambled into one byte (constant per page load). */
function iWs(start) {
    const x = Math.trunc(start / 259200000) | 0;
    return ((((x << 5) | (x >>> 27)) & 65535) ^ (x >>> 3) ^ 40503) & 255;
}

/** f.i_df: FNV-1a of cc + i_ca + i_cb + width + "x" + height + hardwareConcurrency (numbers as decimal text). */
function iDf({cc, ca, cb, width, height, cores}) {
    return fnv1a32(`${cc}${ca}${cb}${width}x${height}${cores}`);
}

/** f.p / f.q are cumulative " ~ "-joined lists of new script (p) and iframe (q) sources without their query string. */
function appendSource(list, src) {
    const base = src.split("?")[0];
    return list.includes(base) ? list : `${list} ~ ${base}`;
}

/** `h`: class of the call stack at token time (fn_59349). Not an engine detection, see the notes. */
function classifyStack(stack, vendor = "") {
    if (stack.includes("processCallLaterQueue") || stack.includes("addMouseModeDelegate") || vendor.slice(0, 5) === "Apple") return "I";
    return stack.includes("eval") ? "J" : "K";
}

/**
 * f.pub (build 16520 and later, websocket tokens only, fn_70657 and fn_31070): the pending subscribe and unsubscribe topic lists as
 * `s<subscribe>`, `u<unsubscribe>` or `s<subscribe>|u<unsubscribe>`; undefined (the field is omitted) when both are empty.
 *
 * The program also cuts each list to 1023 characters at a comma (fn_70041, and to 510 each when together longer than 1021), but
 * that has no effect: `RET` stores the return value in the caller's register and then copies back every register of the keep set
 * accumulated so far, which already holds the list registers (from fn_70154), so the untruncated list overwrites the result.
 * Real tokens confirm it (1319 and 1250 character lists appear whole).
 */
function pubValue(subscribe = "", unsubscribe = "") {
    if (subscribe === "" && unsubscribe === "") return undefined;
    if (subscribe === "") return `u${unsubscribe}`;
    return unsubscribe === "" ? `s${subscribe}` : `s${subscribe}|u${unsubscribe}`;
}

const le = raw => Number(raw.reduceRight((n, byte) => (n << 8n) | BigInt(byte), 0n));

/** The nested block `f` as an object; integer keys are decoded from their little-endian bytes. */
function nestedFields(raw) {
    const out = {};
    for (const {key, raw: bytes, value} of parseNested(raw).records) out[key] = NESTED_INT_KEYS.has(key) ? le([...bytes]) : value;
    return out;
}

/**
 * Checks the field rules on captured tokens `[{value, url}]`; `serverTime` is the page's SERVER_TIME in seconds.
 * `now` of a token (the Date.now() of the VM handler) is recovered from its IV. Tokens are processed in creation order.
 * Returns {rows, checks: [{name, ok, detail}]}.
 */
function checkFieldRules(tokens, {serverTime} = {}) {
    const rows = tokens.map((t, index) => {
        const {fields, iv} = decodeToken(t.value);
        const now = findIvTime(iv, fields.b, Number(fields.d) - 60000, Number(fields.d) + 60000);
        return {index, url: t.url, fields, f: nestedFields(fields.f), now, isSocket: fields.u.startsWith("/zap/")};
    });
    rows.sort((a, b) => a.now - b.now || a.f.i_r - b.f.i_r);
    const checks = [];
    const check = (name, ok, detail = "") => checks.push({name, ok, detail});
    const all = (name, predicate, detail) => {
        const failed = rows.filter(r => !predicate(r));
        check(name, failed.length === 0, failed.length ? `${failed.length}/${rows.length} fail, first #${failed[0].index}` : detail || `${rows.length}/${rows.length}`);
    };

    all("`now` recovered from the IV", r => r.now !== undefined);

    // f.i_r: counter over all tokens, not advanced by the uncounted URLs
    let counter = 0;
    all("f.i_r = number of tokens so far, skipping uncounted URLs", r => {
        if (isCountedUrl(r.fields.u)) counter++;
        return r.f.i_r === counter;
    });

    // f.i_au: the hook records the time of every Loader.load after the first token; HTTP tokens are created inside that call
    let lastLoad;
    all("f.i_au = seconds since the last Loader.load (1111 before the first recorded one)", r => {
        const expected = activityAge(r.now, lastLoad);
        if (r.isSocket) return r.f.i_au >= expected && r.f.i_au <= expected + 1 || (lastLoad === undefined && r.f.i_au === NO_ACTIVITY);
        const ok = lastLoad === undefined && r.index === rows[0].index ? r.f.i_au === NO_ACTIVITY : r.f.i_au === 0;
        if (r.index !== rows[0].index) lastLoad = r.now;
        return ok;
    }, "HTTP tokens 0 (first one 1111), socket tokens within 1 s");
    all("aa (flag word C) = 1 exactly when f.i_au is not 0 or 1111", r => Number(r.fields.aa) === flagC(r.f.i_au));

    // f.i_pl and the clock skew both depend on the script start time, which the data must bracket consistently
    const low = Math.max(...rows.map(r => r.now - r.f.i_pl * 1000 - 999));
    const high = Math.min(...rows.map(r => r.now - r.f.i_pl * 1000));
    check("f.i_pl = seconds since the script start (a start time exists for all tokens)", low <= high, `start in [${low}, ${high}]`);
    const skews = new Set(rows.map(r => Number(r.fields.d) - r.now));
    let [first, last] = [low, high];
    if (serverTime !== undefined && skews.size === 1) {
        // the skew fixes the whole second of the start time: floor(start / 1000) = SERVER_TIME - skew / 1000
        const [skew] = skews;
        const second = (serverTime - skew / 1000) * 1000;
        [first, last] = [Math.max(low, second), Math.min(high, second + 999)];
        check("d = now + 1000 * (SERVER_TIME - seconds of the start time)", first <= last, `skew ${skew} ms, start in [${first}, ${last}]`);
    } else check("d - now is the same for all tokens", skews.size === 1, [...skews].join(", "));
    check("f.i_ws follows from the start time", rows.every(r => r.f.i_ws === iWs(first) && r.f.i_ws === iWs(last)), `0x${rows[0].f.i_ws.toString(16)}`);

    all("f.i_df = FNV-1a(cc + i_ca + i_cb + width x height + cores)", r => r.f.i_df === iDf({cc: r.f.cc, ca: r.f.i_ca, cb: r.f.i_cb, width: r.f.i_sw, height: r.f.i_sh, cores: r.f.i_hc}));
    all("f.i_vr, f.i_hp, f.i_kl are the literals 157, 66, 231", r => r.f.i_vr === 157 && r.f.i_hp === 66 && r.f.i_kl === 231);
    all("f.i_z equals v (boot state)", r => r.f.i_z === Number(r.fields.v));
    all("f.x equals ab (\"s\" after the environment stage)", r => r.f.x === r.fields.ab);

    // f.p only grows: once a source is listed, later tokens keep it as a prefix
    let list = "";
    all("f.p is cumulative (each value extends the previous one)", r => {
        const value = r.f.p || "";
        const ok = value === "" ? list === "" : value.startsWith(list);
        if (value !== "") list = value;
        return ok;
    });
    all("f.p entries are ' ~ '-joined URLs (any scheme, e.g. moz-extension://) without a query string", r => !r.f.p || r.f.p.split(" ~ ").slice(1).every(u => /^[a-z][a-z0-9+.-]*:\/\/[^?]+$/.test(u)));

    // build 16520 adds f.pub to subscribe (0x16) and unsubscribe (0x17) messages: "s"/"u" followed by the message's topic list
    const withTopics = tokens.filter(t => t.topics !== undefined);
    if (withTopics.length) {
        const pubs = withTopics.map(t => nestedFields(decodeToken(t.value).fields.f).pub).filter(pub => pub !== undefined);
        const expected = withTopics.filter(t => [0x16, 0x17].includes(t.message_type)).map(t => pubValue(t.message_type === 0x16 ? t.topics : "", t.message_type === 0x17 ? t.topics : ""));
        const matched = pubs.filter(pub => expected.includes(pub)).length;
        check("f.pub = s|u + the topic list of the websocket message (build 16520 and later)", pubs.length === matched, `${matched}/${pubs.length} tokens with pub match a message`);
    }
    return {rows, checks};
}

module.exports = {NO_ACTIVITY, UNCOUNTED_URL_PARTS, isCountedUrl, activityAge, flagC, pageAge, clockSkew, iWs, iDf, appendSource, classifyStack, pubValue, nestedFields, checkFieldRules};
