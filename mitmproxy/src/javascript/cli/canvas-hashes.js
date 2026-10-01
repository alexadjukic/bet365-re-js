#!/usr/bin/env node
"use strict";

/*
 * Prints the canvas hashes of this machine's headless Firefox as JSON:
 *   node mitmproxy/src/javascript/cli/canvas-hashes.js [--firefox /path/to/firefox] [--noise-seed 12345]
 * --noise-seed simulates per-session canvas noise: the same seed gives the same hashes, another seed other ones.
 * The output has the names the token generator's browser profile uses (canvasA, canvasB, canvasRandomised).
 */

const {generateCanvasHashes} = require("../canvas-hash/canvas-hash");

const option = (name) => {
    const at = process.argv.indexOf(name);
    return at > -1 ? process.argv[at + 1] : undefined;
};
const firefoxPath = option("--firefox");
const seed = option("--noise-seed");

generateCanvasHashes({firefoxPath, noiseSeed: seed === undefined ? undefined : Number(seed)}).then(({i_ca, i_cb, i_cr}) => {
    console.log(JSON.stringify({canvasA: i_ca, canvasB: i_cb, canvasRandomised: i_cr === 1}, null, 2));
}, (error) => {
    console.error(error.message);
    process.exit(1);
});
