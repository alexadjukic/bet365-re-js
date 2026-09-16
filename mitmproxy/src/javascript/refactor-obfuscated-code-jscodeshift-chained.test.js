import {getOutputFiles, verifyFileExists} from "./refactor-obfuscated-code-jscodeshift-test-util.js";
import j from "jscodeshift";
import {v4 as uuidv4} from "uuid";
import {ChainedTransformer} from "./refactor-obfuscated-code-jscodeshift-chained";

const jscodeshiftAst = j("");

describe("outputToFile", () => {
    test("transform creates file", () => {
        const transformer = createMock();
        transformer.transform();

        const intermediateStepNumbers = [11, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
        const outputFiles = getOutputFiles(transformer.outputBaseName);
        expect(outputFiles.length).toBe(intermediateStepNumbers.length + 1);
        for (const stepNumber of intermediateStepNumbers) {
            verifyFileExists(transformer.outputBaseName, stepNumber, false);
        }
        verifyFileExists(transformer.outputBaseName, "end");
    });
});

function createMock() {
    return new ChainedTransformer(jscodeshiftAst, true, uuidv4());
}
