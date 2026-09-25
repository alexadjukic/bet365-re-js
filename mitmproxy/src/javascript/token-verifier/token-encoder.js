/**
 * Encoder for X-Net-Sync-Term tokens: the inverse of decodeToken in token-verifier.js.
 *
 * A token is base64( header(4) || sstLen(2, BE) || sst || IV(16) || AES-128-CTR(records) ), records being
 * [keyLen(1)][key][valLen(2, LE)][val]. Records are given as an ordered list of [key, value] pairs because the
 * order is part of the token. Numbers are written as little-endian integers of width 1, 2, 4 or 8 bytes (see
 * minimalWidth); strings and Buffers are written as they are.
 */
const {INT_KEYS, aesCtr, ivFor, checksumFor, decodeToken, parseNested, findIvTime} = require("./token-verifier");

const DEFAULT_HEADER = Buffer.from([0x03, 0x48, 0x00, 0x04]);

// per-key width overrides; none are needed so far (the width rule of minimalWidth matches all real tokens)
const FIXED_WIDTH = {};

// keys of the nested block `f` that hold integers (everything else there is a string)
const NESTED_INT_KEYS = new Set(["i_u", "i_r", "i_tf", "i_bt", "i_ps", "i_z", "i_au", "i_pl", "i_ca", "i_cb", "i_cr", "i_df", "i_sw", "i_sh", "i_hc", "i_vr", "i_hp", "i_kl", "i_ws"]);

/**
 * Width chosen by the VM (tlvInt): 1 byte below 2^8, 2 below 2^16, 4 up to the signed 32-bit maximum, else 8.
 * Real tokens: a checksum `p` of 618673239 takes 4 bytes but 2456352589 (above 2^31) takes 8, and the 4-byte
 * boundary is therefore 2^31, not 2^32. The 2-byte upper boundary (2^15 or 2^16) is not tested by any real value.
 */
function minimalWidth(value) {
    const n = BigInt(value);
    if (n < 0n) throw new RangeError("negative integers are not used in tokens");
    if (n < 1n << 8n) return 1;
    if (n < 1n << 16n) return 2;
    if (n < 1n << 31n) return 4;
    return 8;
}

function encodeInt(value, width = minimalWidth(value)) {
    const out = Buffer.alloc(width);
    let n = BigInt(value);
    for (let i = 0; i < width; i++, n >>= 8n) out[i] = Number(n & 0xffn);
    return out;
}

function encodeRecord(key, valueBytes) {
    const head = Buffer.alloc(1 + key.length + 2);
    head[0] = key.length;
    head.write(key, 1, "latin1");
    head.writeUInt16LE(valueBytes.length, 1 + key.length);
    return Buffer.concat([head, valueBytes]);
}

/** entries: ordered [key, value] pairs; value is a string, a number/bigint, or a Buffer (used as is). */
function encodeRecords(entries, {intKeys = INT_KEYS, fixedWidth = FIXED_WIDTH} = {}) {
    return Buffer.concat(entries.map(([key, value]) => {
        let bytes;
        if (Buffer.isBuffer(value)) bytes = value;
        else if (intKeys.has(key) || typeof value === "number" || typeof value === "bigint") bytes = encodeInt(value, fixedWidth[key]);
        else bytes = Buffer.from(String(value), "latin1");
        return encodeRecord(key, bytes);
    }));
}

/** Encodes the nested block `f` from ordered [key, value] pairs (integer keys as in NESTED_INT_KEYS). */
function encodeNested(entries) {
    return encodeRecords(entries, {intKeys: NESTED_INT_KEYS});
}

/** Assembles a token from already encoded parts. `sst` is the payload without its 2-byte length. */
function assembleToken({header = DEFAULT_HEADER, sst, iv, plaintext}) {
    const length = Buffer.from([sst.length >> 8, sst.length & 0xff]);
    return Buffer.concat([header, length, sst, iv, aesCtr(plaintext, iv)]).toString("base64");
}

/**
 * Builds a token from field values.
 *   entries: ordered [key, value] pairs of the outer record list; `p` is recomputed unless keepChecksum is set,
 *            and `f` may be given as ordered pairs (then it is encoded with encodeNested) or as a Buffer.
 *   sst:     Buffer, the SST payload (atob(WebsiteConfig.SST) without its 2-byte length)
 *   ivTime:  the time in ms that goes into the IV (real tokens: d + 1000); defaults to d + 1000
 *   iv:      an explicit 16-byte IV that replaces the one derived from ivTime and the nonce
 */
function buildToken({entries, sst, ivTime, iv, header, keepChecksum = false}) {
    const fields = Object.fromEntries(entries);
    if (!keepChecksum && "p" in fields) fields.p = checksumFor(fields);
    const encoded = entries.map(([key, value]) => {
        if (key === "p" && !keepChecksum) value = fields.p;
        if (key === "f" && Array.isArray(value)) value = encodeNested(value);
        return [key, value];
    });
    return assembleToken({header, sst, iv: iv ?? ivFor(ivTime ?? Number(fields.d) + 1000, fields.b), plaintext: encodeRecords(encoded)});
}

/** Splits a decoded token into what buildToken needs, with values in their natural types. */
function toBuildInput(token) {
    const decoded = decodeToken(token);
    const entries = decoded.records.map(({key, value}) => {
        if (key !== "f") return [key, value];
        const nested = parseNested(value).records.map(r => [r.key, NESTED_INT_KEYS.has(r.key) ? intOf(r.raw) : r.raw.toString("latin1")]);
        return [key, nested];
    });
    const ivTime = findIvTime(decoded.iv, decoded.fields.b, decoded.fields.d - 60000, decoded.fields.d + 60000);
    return {entries, sst: decoded.sst, ivTime, header: decoded.header};
}

function intOf(raw) {
    let n = 0n;
    for (let i = raw.length - 1; i >= 0; i--) n = (n << 8n) | BigInt(raw[i]);
    return n <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(n) : n;
}

module.exports = {DEFAULT_HEADER, FIXED_WIDTH, NESTED_INT_KEYS, minimalWidth, encodeInt, encodeRecord, encodeRecords, encodeNested, assembleToken, buildToken, toBuildInput};
