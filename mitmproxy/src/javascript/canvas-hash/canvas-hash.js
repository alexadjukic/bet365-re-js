"use strict";

/*
 * Offline generator for the two canvas hashes of the token (f.i_ca, f.i_cb) and the noise flag f.i_cr.
 *
 * The site's function is fn_56655 (16504) / fn_56921 (16520, 16528) in received-32.js: two separate 280x60
 * canvases with the same drawing and a different text, then fnv1a32(canvas.toDataURL()). The drawing is
 * identical in all three builds (see data/notes/chunk-explanations.md), so this file is build independent.
 *
 * The pixels depend on the browser that renders them (fonts, rasteriser, GPU, any canvas noise), so the
 * drawing is run in a real headless Firefox (the captures were made with Firefox 156 on Linux). Firefox is
 * driven through WebDriver BiDi over a plain WebSocket: no npm dependency. No page is loaded (about:blank)
 * and nothing is requested from any site.
 */

const {spawn} = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const {fnv1a32} = require("../token-verifier/token-verifier");
// the code that runs in the page lives in canvas-page.js, shared with the Python implementation
const {drawCanvases, installNoise, CANVAS_A_TEXT, CANVAS_B_TEXT} = require("./canvas-page");

function hashUrl(url) {
    return url === null ? 0 : fnv1a32(url);
}

/** Turns the page's answer into the token fields. */
function toFields({urlA, urlB, differs}) {
    return {i_ca: hashUrl(urlA), i_cb: hashUrl(urlB), i_cr: differs ? 1 : 0};
}

function findFirefox(explicit) {
    const candidates = [explicit, process.env.FIREFOX_BIN, "/usr/bin/firefox", "/usr/local/bin/firefox",
        "/Applications/Firefox.app/Contents/MacOS/firefox", "C:\\Program Files\\Mozilla Firefox\\firefox.exe"];
    const found = candidates.find((c) => c && fs.existsSync(c));
    if (!found) throw new Error("Firefox not found: install it or pass {firefoxPath} / set FIREFOX_BIN");
    return found;
}

/** Starts a headless Firefox with a throw-away profile and resolves once its BiDi endpoint is known. */
function launchFirefox(firefoxPath, timeoutMs, prefs) {
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), "canvas-hash-"));
    fs.writeFileSync(path.join(profile, "user.js"),
        Object.entries(prefs).map(([name, value]) => `user_pref(${JSON.stringify(name)}, ${JSON.stringify(value)});\n`).join(""));
    const child = spawn(firefoxPath, ["--headless", "--no-remote", "--profile", profile,
        "--remote-debugging-port", "0", "about:blank"], {stdio: ["ignore", "ignore", "pipe"]});

    const cleanup = () => {
        child.kill("SIGKILL");
        fs.rmSync(profile, {recursive: true, force: true});
    };

    return new Promise((resolve, reject) => {
        let log = "";
        const timer = setTimeout(() => {
            cleanup();
            reject(new Error(`Firefox did not open its BiDi endpoint within ${timeoutMs} ms\n${log}`));
        }, timeoutMs);
        child.on("error", (error) => { clearTimeout(timer); cleanup(); reject(error); });
        child.on("exit", (code) => { clearTimeout(timer); reject(new Error(`Firefox exited early (${code})\n${log}`)); });
        child.stderr.on("data", (chunk) => {
            log += chunk;
            const match = /WebDriver BiDi listening on (ws:\/\/[^\s]+)/.exec(log);
            if (match) { clearTimeout(timer); resolve({endpoint: match[1], cleanup}); }
        });
    });
}

/** Minimal WebDriver BiDi client: send(method, params) resolves with the command result. */
function connect(endpoint) {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(endpoint);
        const pending = new Map();
        let nextId = 1;
        socket.onerror = () => reject(new Error(`cannot connect to ${endpoint}`));
        socket.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const entry = pending.get(message.id);
            if (!entry) return;
            pending.delete(message.id);
            if (message.type === "error") entry.reject(new Error(`${message.error}: ${message.message}`));
            else entry.resolve(message.result);
        };
        socket.onopen = () => resolve({
            send: (method, params = {}) => new Promise((res, rej) => {
                const id = nextId++;
                pending.set(id, {resolve: res, reject: rej});
                socket.send(JSON.stringify({id, method, params}));
            }),
            close: () => socket.close(),
        });
    });
}

/** Converts a BiDi RemoteValue (object/array/string/boolean/null) into a plain value. */
function fromRemote(value) {
    if (!value) return undefined;
    switch (value.type) {
        case "null": case "undefined": return null;
        case "object": return Object.fromEntries(value.value.map(([k, v]) => [k, fromRemote(v)]));
        case "array": return value.value.map(fromRemote);
        default: return value.value;
    }
}

/**
 * Draws the two canvases in a headless Firefox and returns {i_ca, i_cb, i_cr}.
 *
 * i_ca / i_cb: unsigned 32-bit integers, as sent in the token. i_cr: 1 if two consecutive toDataURL() calls of
 * canvas A differed (canvas noise), else 0.
 *
 * `prefs` are written to the throw-away profile's user.js (about:config names), e.g. to reproduce a browser that
 * randomises canvas output: {"privacy.fingerprintingProtection": true}.
 *
 * `noiseSeed` (an unsigned 32-bit integer) simulates a browser with per-session canvas noise, see installNoise:
 * the same seed always gives the same hashes, another seed gives other hashes, i_cr stays 0. Without it the
 * plain rendering of this browser is returned.
 *
 * @param {{firefoxPath?: string, timeoutMs?: number, prefs?: Object<string, string|number|boolean>, noiseSeed?: number}} [options]
 * @returns {Promise<{i_ca: number, i_cb: number, i_cr: number}>}
 */
async function generateCanvasHashes({firefoxPath, timeoutMs = 30000, prefs = {}, noiseSeed} = {}) {
    if (noiseSeed !== undefined && !(Number.isInteger(noiseSeed) && noiseSeed >= 0 && noiseSeed <= 0xffffffff)) {
        throw new RangeError(`noiseSeed must be an unsigned 32-bit integer, got ${noiseSeed}`);
    }
    const noise = noiseSeed === undefined ? "" : `(${installNoise.toString()})(${noiseSeed});`;
    const {endpoint, cleanup} = await launchFirefox(findFirefox(firefoxPath), timeoutMs, prefs);
    let client;
    try {
        client = await connect(`${endpoint}/session`);
        await client.send("session.new", {capabilities: {}});
        const {contexts} = await client.send("browsingContext.getTree");
        const result = await client.send("script.callFunction", {
            functionDeclaration: `() => { ${noise} return (${drawCanvases.toString()})(${JSON.stringify(CANVAS_A_TEXT)}, ${JSON.stringify(CANVAS_B_TEXT)}); }`,
            target: {context: contexts[0].context},
            awaitPromise: false,
            resultOwnership: "none",
            serializationOptions: {maxObjectDepth: 2},
        });
        if (result.type !== "success") throw new Error(`script failed: ${JSON.stringify(result.exceptionDetails)}`);
        return toFields(fromRemote(result.result));
    } finally {
        if (client) client.close();
        cleanup();
    }
}

module.exports = {generateCanvasHashes, drawCanvases, installNoise, toFields, CANVAS_A_TEXT, CANVAS_B_TEXT};
