#!/usr/bin/env node
/**
 * Batch deobfuscate every *.js file in a directory.
 *
 *   node deobfuscate-all.js [--in data/obfuscated] [--out data/deobfuscated]
 *                           [--steps] [--force] [--jobs N]
 *
 * Output files keep the basename of their input, so data/obfuscated/X.js -> data/deobfuscated/X.js.
 * Files whose output is already newer than the input are skipped unless --force is given.
 * --steps also writes intermediate results to data/intermediate/<name>/step-<n>.js.
 */
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {spawn} = require("node:child_process");

const repoRoot = path.resolve(__dirname, "../../../..");
const single = path.join(__dirname, "deobfuscate.js");

function parseArgs(argv) {
    const opts = {
        in: path.join(repoRoot, "data/obfuscated"),
        out: path.join(repoRoot, "data/deobfuscated"),
        steps: false,
        force: false,
        jobs: Math.max(1, os.cpus().length - 1),
    };
    for (let i = 0; i < argv.length; i++) {
        switch (argv[i]) {
            case "--in": opts.in = path.resolve(argv[++i]); break;
            case "--out": opts.out = path.resolve(argv[++i]); break;
            case "--jobs": opts.jobs = Math.max(1, parseInt(argv[++i], 10) || 1); break;
            case "--steps": opts.steps = true; break;
            case "--force": opts.force = true; break;
            default:
                console.error(`Unknown argument: ${argv[i]}`);
                process.exit(2);
        }
    }
    return opts;
}

function run(inputFile, outputFile, stepsDir) {
    return new Promise(resolve => {
        const args = [single, inputFile, outputFile];
        if (stepsDir) args.push("--steps-dir", stepsDir);
        const child = spawn(process.execPath, args, {stdio: ["ignore", "ignore", "pipe"]});
        let stderr = "";
        child.stderr.on("data", chunk => stderr += chunk);
        child.on("close", code => resolve({code, stderr}));
    });
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    if (!fs.existsSync(opts.in)) {
        console.error(`Input directory not found: ${opts.in}`);
        process.exit(2);
    }
    const files = fs.readdirSync(opts.in).filter(f => f.endsWith(".js")).sort();
    const summary = {ok: 0, skipped: 0, failed: []};
    let next = 0;

    async function worker() {
        while (next < files.length) {
            const name = files[next++];
            const inputFile = path.join(opts.in, name);
            const outputFile = path.join(opts.out, name);
            if (!opts.force && fs.existsSync(outputFile)
                && fs.statSync(outputFile).mtimeMs >= fs.statSync(inputFile).mtimeMs) {
                summary.skipped++;
                continue;
            }
            const stepsDir = opts.steps
                ? path.join(repoRoot, "data/intermediate", path.basename(name, ".js")) : undefined;
            const {code, stderr} = await run(inputFile, outputFile, stepsDir);
            if (code === 0) {
                summary.ok++;
                console.log(`ok      ${name}`);
            } else {
                summary.failed.push(name);
                console.error(`FAILED  ${name}\n${stderr.trim().split("\n").slice(0, 5).join("\n")}`);
            }
        }
    }

    await Promise.all(Array.from({length: Math.min(opts.jobs, files.length)}, worker));
    console.log(`\n${files.length} files: ${summary.ok} ok, ${summary.skipped} skipped, ${summary.failed.length} failed`);
    process.exit(summary.failed.length ? 1 : 0);
}

main();
