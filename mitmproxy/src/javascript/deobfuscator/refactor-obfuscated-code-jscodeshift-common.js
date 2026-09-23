const {parse} = require("@babel/parser");
const generate = require("@babel/generator").default;
const fs = require("node:fs");
const path = require("node:path");

class AstTransformer {
    constructor(stepNumber, jscodeshiftAst, output, outputBaseName) {
        if (this.constructor === AstTransformer) {
            throw new Error("not instantiable");
        }
        this.stepNumber = stepNumber;
        this.jscodeshiftAst = jscodeshiftAst;
        this.output = output;
        this.outputBaseName = outputBaseName;
        if (null == this.stepNumber) {
            throw new TypeError("stepNumber cannot be null");
        }
        if (null == this.jscodeshiftAst) {
            throw new TypeError("jscodeshiftAst cannot be null");
        }
        if (null == this.output) {
            throw new TypeError("output cannot be null");
        }
        if (null == this.outputBaseName) {
            this.outputFileName = `deobfuscated-output-${this.stepNumber}.js`;
        } else {
            this.outputFileName = `${outputBaseName}-${this.stepNumber}.js`;
        }
    }

    performTransform() {
        throw new Error("implement");
    }

    transform() {
        this.performTransform();
        if (this.output) {
            this.outputToFile();
        }
        return this.jscodeshiftAst;
    }

    outputToFile() {
        const jsCode = generate(parse(this.jscodeshiftAst.toSource(), {sourceType: "script"})).code;
        // an absolute outputBaseName places the step files in an arbitrary directory
        const outputFilePath = path.resolve(__dirname, this.outputFileName);
        fs.mkdirSync(path.dirname(outputFilePath), {recursive: true});
        fs.writeFileSync(outputFilePath, jsCode);
    }
}

class ChainedTransformer extends AstTransformer {
    chainedTransformers;

    constructor(jscodeshiftAst, output, outputBaseName, chainedTransformers) {
        super("end", jscodeshiftAst, output, outputBaseName);
        this.chainedTransformers = chainedTransformers;
    }

    performTransform() {
        let ast = this.jscodeshiftAst;
        debugger;
        this.chainedTransformers.forEach(transformer => {
            ast = transformer.transform();
        })
        return ast;
    }
}

module.exports = {AstTransformer, ChainedTransformer};
