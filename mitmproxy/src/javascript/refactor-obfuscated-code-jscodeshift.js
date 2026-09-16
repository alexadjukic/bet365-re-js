const fs = require("node:fs");
const j = require("jscodeshift");
const esprima = require("esprima");
const escodegen = require("escodegen");
const {ChainedTransformer} = require("./refactor-obfuscated-code-jscodeshift-chained");

const rawObfuscatedJsFileName = process.argv[2];
const deobfuscatedJsFileName = process.argv[3];
const outputIntermediateSteps = process.argv[4] ?? true;
if (!rawObfuscatedJsFileName) {
    throw new Error('Provide an obfuscated file');
}
if (!deobfuscatedJsFileName) {
    throw new Error('Provide an path to deobfuscated file');
}

function transform(rawObfuscatedJsCode) {
    return new ChainedTransformer(j(rawObfuscatedJsCode), outputIntermediateSteps).transform();
}

const rawObfuscatedJsCode = fs.readFileSync(rawObfuscatedJsFileName).toString();
const transformedJscodeshiftAst = transform(rawObfuscatedJsCode);
const ast = esprima.parseScript(transformedJscodeshiftAst.toSource());

// convert into ast for pretty printing
const refactoredJsCode = escodegen.generate(ast);
fs.writeFileSync(deobfuscatedJsFileName, refactoredJsCode);
