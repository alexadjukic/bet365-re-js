#!/usr/bin/env node
/**
 * Deobfuscate a single file.
 *
 *   node deobfuscate.js <obfuscated.js> <deobfuscated.js> [--steps-dir DIR]
 *
 * With --steps-dir the output of every intermediate transform is written to DIR/step-<n>.js.
 * download-payload.py calls this with just the two positional arguments.
 */
const fs = require("node:fs");
const path = require("node:path");
const jscodeshift = require("jscodeshift");
const {parse} = require("@babel/parser");
const generate = require("@babel/generator").default;
const {ChainedTransformer} = require("../deobfuscator/refactor-obfuscated-code-jscodeshift-chained");

// jscodeshift's default parser uses sourceType "module", which rejects scripts that declare a name with both
// `var` and a top-level `function`. The bundles are classic scripts, so parse them as such (other options match
// jscodeshift's default babel5Compat parser).
const scriptParser = {
    parse: code => parse(code, {
        sourceType: "script",
        allowHashBang: true,
        allowReturnOutsideFunction: true,
        tokens: true,
        plugins: [
            "estree",
            "jsx",
            "asyncGenerators",
            "classProperties",
            "doExpressions",
            "exportExtensions",
            "functionBind",
            "functionSent",
            "objectRestSpread",
            "dynamicImport",
            "nullishCoalescingOperator",
            "optionalChaining",
            ["decorators", {decoratorsBeforeExport: false}],
        ],
    }),
};
const j = jscodeshift.withParser(scriptParser);

function deobfuscate(inputFile, outputFile, stepsDir) {
    const code = fs.readFileSync(inputFile).toString();
    const outputSteps = Boolean(stepsDir);
    const stepsBaseName = outputSteps ? path.resolve(stepsDir, "step") : undefined;
    const transformed = new ChainedTransformer(j(code), outputSteps, stepsBaseName).transform();
    // convert into ast for pretty printing
    const refactored = generate(parse(transformed.toSource(), {sourceType: "script"})).code;
    fs.mkdirSync(path.dirname(path.resolve(outputFile)), {recursive: true});
    fs.writeFileSync(outputFile, refactored);
}

module.exports = {deobfuscate};

if (require.main === module) {
    const args = process.argv.slice(2);
    let stepsDir;
    const positional = [];
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--steps-dir") stepsDir = args[++i];
        else positional.push(args[i]);
    }
    const [inputFile, outputFile] = positional;
    if (!inputFile || !outputFile) {
        console.error("Usage: deobfuscate.js <obfuscated.js> <deobfuscated.js> [--steps-dir DIR]");
        process.exit(2);
    }
    deobfuscate(inputFile, outputFile, stepsDir);
}
