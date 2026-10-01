"use strict";

/*
 * The code that runs INSIDE the browser page. Shared by the Node implementation (canvas-hash.js) and the Python one
 * (mitmproxy/src/python/main/canvas_hashes.py), which reads this file as text and evaluates it in the page, so the
 * two cannot drift apart. Keep it self-contained: no imports, no reference to anything outside the two functions.
 * (Evaluated in a page, `module` is undefined: the export at the end is guarded.)
 */

const CANVAS_A_TEXT = "b3-FP-v1-alpha";
const CANVAS_B_TEXT = "x9-FP-v1-bravo";

/*
 * Mirrors the site's VM function step by step; a canvas whose 2d context is missing is skipped and yields null
 * (the VM keeps its hash at 0). Returns the two data URLs and whether two consecutive toDataURL() calls of
 * canvas A differ (i_cr).
 */
function drawCanvases(textA, textB) {
    function draw(text, repeat) {
        const canvas = document.createElement("canvas");
        canvas.width = 280;
        canvas.height = 60;
        const ctx = canvas.getContext("2d");
        if (ctx == undefined) return {url: null, differs: false};
        ctx.fillStyle = "rgb(0,128,0)";
        ctx.fillRect(0, 0, 280, 60);
        ctx.fillStyle = "rgb(255,165,0)";
        ctx.font = "16pt Arial";
        ctx.fillText(text, 10, 40);
        ctx.strokeStyle = "rgb(0,128,128)";
        ctx.beginPath();
        ctx.arc(200, 30, 20, 0, 6);
        ctx.stroke();
        const url = canvas.toDataURL();
        return {url, differs: repeat ? url !== canvas.toDataURL() : false};
    }

    const a = draw(textA, true);
    const b = draw(textB, false);
    return {urlA: a.url, urlB: b.url, differs: a.differs};
}

/*
 * Runs before the drawing. Simulates a browser that randomises canvas output per session: toDataURL() is wrapped so
 * that it returns a copy of the canvas with the lowest bit of one colour channel flipped in a seed-chosen set of
 * pixels (about 1 in 200). The pixel choice restarts from the seed on every call, so two calls on the same canvas
 * agree (i_cr stays 0), like a browser whose noise is fixed for the session; a different seed gives a different
 * hash. Opaque pixels only: the read/write round trip is then lossless.
 */
function installNoise(seed) {
    const original = HTMLCanvasElement.prototype.toDataURL;
    HTMLCanvasElement.prototype.toDataURL = function (...args) {
        const copy = document.createElement("canvas");
        copy.width = this.width;
        copy.height = this.height;
        const ctx = copy.getContext("2d");
        ctx.drawImage(this, 0, 0);
        const image = ctx.getImageData(0, 0, copy.width, copy.height);
        let state = seed >>> 0;
        const next = () => { // mulberry32
            state = (state + 0x6d2b79f5) >>> 0;
            let t = state;
            t = Math.imul(t ^ (t >>> 15), t | 1);
            t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
        const pixels = copy.width * copy.height;
        for (let i = 0; i < Math.ceil(pixels / 200); i++) {
            const at = Math.floor(next() * pixels) * 4 + Math.floor(next() * 3);
            image.data[at] ^= 1;
        }
        ctx.putImageData(image, 0, 0);
        return original.apply(copy, args);
    };
}

if (typeof module !== "undefined") module.exports = {drawCanvases, installNoise, CANVAS_A_TEXT, CANVAS_B_TEXT};
