/**
 * Parser and checker for X-Net-Sync-Term tokens (see data/notes/x-net-sync-term.md).
 *
 * Layout found in real traffic (`03 48 00 04` is the header, sstLen is 2 bytes): base64( header(4) || sstLen(2, BE) || sst(sstLen) || IV(16) || AES-128-CTR(records) ).
 * records: [keyLen(1)][key][valLen(2, LE)][val]...
 */
const crypto = require("node:crypto");

const KEY = Buffer.from([45, 67, 89, 12, 34, 56, 78, 90, 123, 234, 45, 67, 89, 12, 34, 56]);
const HEADER_LENGTH = 4;

// 64-entry table of the custom checksum (fn_67765), stored XOR 127 in the VM program
const HASH_TABLE = [
    1101195530, 1849170683, 1011462487, 1870552039, 2116561607, 1297822139, 495394314, 684556403,
    1902634096, 37428903, 787769321, 1225145233, 40194939, 1093801093, 999607972, 1161745344,
    413066433, 145937900, 1380633445, 337691791, 33891280, 1765845096, 371305101, 1107842788,
    479406669, 1546817993, 1707920019, 461467316, 1760470079, 1921015082, 1040396305, 2062460101,
    528997059, 1754614127, 983305111, 1638855828, 1568835819, 1912562212, 1009689012, 2081581189,
    582619912, 569959051, 1235713677, 1325374686, 978421303, 1698986017, 1291274576, 1359696440,
    1420307973, 1797254114, 1378187939, 645736366, 1209500432, 644363566, 103032208, 416000089,
    1509682968, 566378580, 1686909334, 1593637567, 787797531, 1638172379, 1253768911, 567606730,
];

// keys whose value is a little-endian integer instead of a string
const INT_KEYS = new Set(["b", "d", "p", "q", "r", "v", "w", "aa"]);

function base64ToBuffer(text) {
    return Buffer.from(text.replace(/^x-net-sync-term:\s*/i, "").trim(), "base64");
}

function fnv1a32(text) {
    let h = 0x811c9dc5;
    for (let i = 0; i < text.length; i++) {
        h = Math.imul(h ^ (text.charCodeAt(i) & 0xff), 16777619) >>> 0;
    }
    return h;
}

// AES-128 counter mode where the whole counter block is a big-endian number (verified: byte 15 carries into byte 14)
function aesCtr(data, iv, {carry = true} = {}) {
    const out = Buffer.alloc(data.length);
    const counter = Buffer.from(iv);
    for (let i = 0; i < data.length; i += 16) {
        const cipher = crypto.createCipheriv("aes-128-ecb", KEY, null).setAutoPadding(false);
        const keystream = Buffer.concat([cipher.update(counter), cipher.final()]);
        for (let j = 0; j < 16 && i + j < data.length; j++) out[i + j] = data[i + j] ^ keystream[j];
        if (carry) {
            for (let k = 15; k >= 0 && ++counter[k] === 256; k--) counter[k] = 0;
        } else {
            counter[15] = (counter[15] + 1) & 0xff;
        }
    }
    return out;
}

function splitToken(token) {
    const bytes = Buffer.isBuffer(token) ? token : base64ToBuffer(token);
    const header = bytes.subarray(0, HEADER_LENGTH);
    const sstLength = bytes.readUInt16BE(HEADER_LENGTH);
    const sstEnd = HEADER_LENGTH + 2 + sstLength;
    return {
        header,
        sstLength,
        sst: bytes.subarray(HEADER_LENGTH + 2, sstEnd),
        iv: bytes.subarray(sstEnd, sstEnd + 16),
        ciphertext: bytes.subarray(sstEnd + 16),
    };
}

function readLittleEndian(buffer) {
    let value = 0n;
    for (let i = buffer.length - 1; i >= 0; i--) value = (value << 8n) | BigInt(buffer[i]);
    return value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : value;
}

/** Returns {records: [{key, raw, value}], complete} where complete means the buffer was consumed exactly. */
function parseRecords(plaintext, intKeys = INT_KEYS) {
    const records = [];
    let pos = 0;
    while (pos < plaintext.length) {
        const keyLength = plaintext[pos];
        if (pos + 1 + keyLength + 2 > plaintext.length) break;
        const key = plaintext.toString("latin1", pos + 1, pos + 1 + keyLength);
        const valueLength = plaintext.readUInt16LE(pos + 1 + keyLength);
        const start = pos + 1 + keyLength + 2;
        if (start + valueLength > plaintext.length) break;
        const raw = plaintext.subarray(start, start + valueLength);
        records.push({key, raw, value: intKeys.has(key) ? readLittleEndian(raw) : raw.toString("latin1")});
        pos = start + valueLength;
    }
    return {records, complete: pos === plaintext.length};
}

function decodeToken(token) {
    const parts = splitToken(token);
    const plaintext = aesCtr(parts.ciphertext, parts.iv);
    const {records, complete} = parseRecords(plaintext);
    const fields = {};
    for (const {key, value} of records) if (!(key in fields)) fields[key] = value;
    return {...parts, plaintext, records, complete, fields};
}

/** The VM's custom 32-bit hash (fn_68005 with fn_67938 and fn_67772). Characters above 255 are ignored like in the VM. */
function hash32(text) {
    let h = 0;
    for (let i = 0; i < text.length; i++) {
        const code = text.charCodeAt(i);
        if (code <= 256) h ^= code;
        h = mix4(h);
    }
    return h >>> 0;
}

function mix4(h) {
    for (let i = 0; i < 4; i++) {
        h = (h << 1) | (h >>> 31);
        h ^= HASH_TABLE[i];
        h = mix8(h, i);
    }
    return h;
}

function mix8(h, i) {
    for (let j = 0; j < 8; j++) {
        const t = HASH_TABLE[(i + j) % 64];
        const low = ((h & 0xffff) * ((h ^ t) & 0xffff)) & 0xffff;
        const high = (((h >>> 16) & 0xffff) * ((h ^ t) >>> 16)) & 0xffff;
        h = (h + (low << 16) + high) >>> 0;
        h ^= h >>> ((h & 15) + 1);
    }
    return h;
}

/** IV word i = abs(int32(fnv1a32("0" + now + i + nonce))), 4 bytes big-endian. */
function ivWord(now, i, nonce) {
    return Math.abs(fnv1a32("0" + now + i + nonce) | 0) >>> 0;
}

function ivFor(now, nonce) {
    const iv = Buffer.alloc(16);
    for (let i = 0; i < 4; i++) iv.writeUInt32BE(ivWord(now, i, nonce), 4 * i);
    return iv;
}

/** Finds the `now` (ms) in [from, to] whose IV matches, or undefined. */
function findIvTime(iv, nonce, from, to) {
    const first = iv.readUInt32BE(0);
    for (let now = from; now <= to; now++) {
        if (ivWord(now, 0, nonce) === first && ivFor(now, nonce).equals(iv)) return now;
    }
    return undefined;
}

/** Parses the nested `f` record block, which uses the same record encoding (all values as strings). */
function parseNested(raw) {
    const {records, complete} = parseRecords(Buffer.from(raw, "latin1"), new Set());
    return {records, complete};
}

/** Recomputes the checksum `p` from the decoded fields: hash32(b + r + q + z + b + d + v). */
function checksumFor(fields) {
    return hash32(`${fields.b}${fields.r}${fields.q}${fields.z}${fields.b}${fields.d}${fields.v}`);
}

/**
 * Runs all checks on one token. `session` may hold {sst (base64), serverTime (s), userAgent, timezone}.
 * `request` may hold {url}. Returns {decoded, checks: [{name, ok, detail}]}.
 */
function verifyToken(token, session = {}, request = {}) {
    const checks = [];
    const check = (name, ok, detail = "") => checks.push({name, ok, detail});
    const decoded = decodeToken(token);
    const {fields} = decoded;

    check("header is 03 48 00 04", decoded.header.toString("hex") === "03480004", decoded.header.toString("hex"));
    check("records parse to the end", decoded.complete, `${decoded.records.length} records, ${decoded.plaintext.length} bytes`);
    check("starts with a=\"1\"", fields.a === "1");
    const nested = typeof fields.f === "string" ? parseNested(fields.f) : undefined;
    check("nested block f parses to the end", Boolean(nested && nested.complete), nested ? `${nested.records.length} records` : "missing");

    check("checksum p matches", checksumFor(fields) === fields.p, `p=${fields.p}`);
    const ivTime = findIvTime(decoded.iv, fields.b, fields.d - 60000, fields.d + 60000);
    check("IV matches FNV(nonce b, time)", ivTime !== undefined, ivTime === undefined ? "no time within ±60 s of d" : `IV time - d = ${ivTime - fields.d} ms`);

    if (session.sst) {
        // atob(SST) already starts with its own 2-byte length, which the token carries as well
        const expected = Buffer.from(session.sst, "base64");
        const actual = Buffer.concat([Buffer.from([decoded.sstLength >> 8, decoded.sstLength & 0xff]), decoded.sst]);
        check("SST field equals the captured SST", expected.equals(actual), `token SST ${actual.length} B, captured SST ${expected.length} B`);
    }
    if (session.serverTime) {
        const skew = fields.d - session.serverTime * 1000;
        check("d is close to SERVER_TIME", Math.abs(skew) < 3600 * 1000, `d - SERVER_TIME*1000 = ${skew} ms`);
    }
    if (session.userAgent) check("e equals the user agent", fields.e === session.userAgent);
    if (session.timezone) check("z equals the timezone", session.timezone.startsWith(fields.z), fields.z);
    if (request.url) {
        const url = new URL(request.url);
        // the websocket URL is rewritten to "/zap/?..." and k stays the page host, so k is only checked for XHR
        const isZap = url.pathname.includes("/zap/");
        const expectedU = isZap ? "/zap/" + url.search : url.pathname + url.search;
        check("u equals the request path", fields.u === expectedU, fields.u);
        const host = isZap ? session.pageHost : url.hostname;
        if (host) check("k equals the page host", fields.k === host, fields.k);
    }
    return {decoded, checks};
}

module.exports = {KEY, base64ToBuffer, fnv1a32, hash32, checksumFor, parseNested, verifyToken, aesCtr, splitToken, parseRecords, decodeToken, ivWord, ivFor, findIvTime};
