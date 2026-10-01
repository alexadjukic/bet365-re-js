const fs = require("node:fs");
const {generateCanvasHashes, drawCanvases, toFields, CANVAS_A_TEXT, CANVAS_B_TEXT} = require("./canvas-hash");
const {fnv1a32} = require("../token-verifier/token-verifier");

// A fake DOM that records every call, so the drawing can be compared with the VM function (fn_56655 / fn_56921)
function fakeDocument({context = true, noisy = false} = {}) {
    const log = [];
    let serial = 0;
    global.document = {
        createElement: (tag) => {
            log.push(["createElement", tag]);
            const canvas = {toDataURL: () => { log.push(["toDataURL"]); return `url-${noisy ? serial++ : "same"}-${canvas.text}`; }};
            Object.defineProperty(canvas, "width", {set: (v) => log.push(["width", v])});
            Object.defineProperty(canvas, "height", {set: (v) => log.push(["height", v])});
            canvas.getContext = (kind) => {
                log.push(["getContext", kind]);
                if (!context) return undefined;
                const ctx = {fillRect: (...a) => log.push(["fillRect", ...a]), beginPath: () => log.push(["beginPath"]),
                    arc: (...a) => log.push(["arc", ...a]), stroke: () => log.push(["stroke"]),
                    fillText: (text, ...a) => { canvas.text = text; log.push(["fillText", text, ...a]); }};
                for (const prop of ["fillStyle", "font", "strokeStyle"]) {
                    Object.defineProperty(ctx, prop, {set: (v) => log.push([prop, v])});
                }
                return ctx;
            };
            return canvas;
        },
    };
    return log;
}

afterEach(() => { delete global.document; });

const steps = (text) => [
    ["createElement", "canvas"], ["width", 280], ["height", 60], ["getContext", "2d"],
    ["fillStyle", "rgb(0,128,0)"], ["fillRect", 0, 0, 280, 60],
    ["fillStyle", "rgb(255,165,0)"], ["font", "16pt Arial"], ["fillText", text, 10, 40],
    ["strokeStyle", "rgb(0,128,128)"], ["beginPath"], ["arc", 200, 30, 20, 0, 6], ["stroke"],
    ["toDataURL"],
];

describe("drawCanvases", () => {
    test("performs the steps of the site's function, canvas A with a second toDataURL, canvas B without", () => {
        const log = fakeDocument();
        drawCanvases(CANVAS_A_TEXT, CANVAS_B_TEXT);
        expect(log).toEqual([...steps(CANVAS_A_TEXT), ["toDataURL"], ...steps(CANVAS_B_TEXT)]);
    });

    test("identical calls give different data URLs per canvas and no noise flag", () => {
        fakeDocument();
        const result = drawCanvases(CANVAS_A_TEXT, CANVAS_B_TEXT);
        expect(result.differs).toBe(false);
        expect(result.urlA).not.toBe(result.urlB);
    });

    test("a canvas whose output changes between two toDataURL calls sets the flag", () => {
        fakeDocument({noisy: true});
        expect(drawCanvases(CANVAS_A_TEXT, CANVAS_B_TEXT).differs).toBe(true);
    });

    test("a missing 2d context skips the drawing and yields null", () => {
        const log = fakeDocument({context: false});
        expect(drawCanvases(CANVAS_A_TEXT, CANVAS_B_TEXT)).toEqual({urlA: null, urlB: null, differs: false});
        expect(log.filter(([name]) => name === "fillRect" || name === "toDataURL")).toEqual([]);
    });
});

describe("toFields", () => {
    test("hashes the data URLs with fnv1a32 and maps null to 0", () => {
        expect(toFields({urlA: "a", urlB: null, differs: true})).toEqual({i_ca: fnv1a32("a"), i_cb: 0, i_cr: 1});
    });
});

describe("noiseSeed validation", () => {
    test.each([-1, 1.5, 2 ** 32, "7", NaN])("rejects %p before starting a browser", async (seed) => {
        await expect(generateCanvasHashes({noiseSeed: seed})).rejects.toThrow(RangeError);
    });
});

const hasFirefox = fs.existsSync(process.env.FIREFOX_BIN || "/usr/bin/firefox");
(hasFirefox ? describe : describe.skip)("generateCanvasHashes (real headless Firefox)", () => {
    test("returns two unsigned 32-bit hashes, the same on every run", async () => {
        const first = await generateCanvasHashes();
        const second = await generateCanvasHashes();
        for (const key of ["i_ca", "i_cb"]) {
            expect(Number.isInteger(first[key]) && first[key] >= 0 && first[key] <= 0xffffffff).toBe(true);
        }
        expect(first.i_ca).not.toBe(first.i_cb);
        expect(second).toEqual(first);
    }, 120000);

    test("a noise seed changes both hashes, is reproducible, keeps i_cr at 0 and another seed gives other hashes", async () => {
        const plain = await generateCanvasHashes();
        const seeded = await generateCanvasHashes({noiseSeed: 12345});
        const again = await generateCanvasHashes({noiseSeed: 12345});
        const other = await generateCanvasHashes({noiseSeed: 54321});
        expect(seeded).toEqual(again);
        expect(seeded.i_cr).toBe(0);
        expect(other.i_cr).toBe(0);
        expect(seeded.i_ca).not.toBe(plain.i_ca);
        expect(seeded.i_cb).not.toBe(plain.i_cb);
        expect(other.i_ca).not.toBe(seeded.i_ca);
        expect(other.i_cb).not.toBe(seeded.i_cb);
    }, 180000);
});
