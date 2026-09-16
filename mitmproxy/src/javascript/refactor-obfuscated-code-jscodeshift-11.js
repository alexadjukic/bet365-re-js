const {AstTransformer} = require("./refactor-obfuscated-code-jscodeshift-common");
const j = require("jscodeshift");
const vm = require("node:vm");

// javascript-obfuscator.io emits, per obfuscated scope, a pair of functions:
//   function PROVIDER(){ var arr = [ ...string literals... ]; PROVIDER = function(){ return arr; }; return PROVIDER(); }
//   function DECODER(a,b){ var arr = PROVIDER(); return (DECODER = function(x,y){ return arr[x - OFFSET]; })(a,b); }
// DECODER self-patches on first call, so every call site after that just does DECODER(<index>).
// The literal index/offset numbers, the provider/decoder names, and the junk entries mixed into
// the array are re-randomized on every obfuscation run, but the *shape* above is stable across
// javascript-obfuscator versions and doesn't require a hand-maintained per-build dictionary.
//
// This transformer finds every such decoder by its structural fingerprint (a two-parameter
// function that reassigns itself), pulls together the minimal self-contained source needed to
// evaluate it (the provider, the decoder, and any plain identifier aliases in between), actually
// executes that snippet in an isolated vm sandbox, and replaces every `decoder(<numeric literal>)`
// call anywhere in the file with the literal string it decodes to.
class StringArrayDecoderTransformer extends AstTransformer {
    constructor(stepNumber, jscodeshiftAst, output, outputBaseName) {
        super(stepNumber, jscodeshiftAst, output, outputBaseName);
    }

    performTransform() {
        const root = this.jscodeshiftAst;

        const decoderPaths = this.findDecoderFunctions(root);
        if (decoderPaths.length === 0) {
            return;
        }

        const aliasesOf = this.buildAliasMap(root, decoderPaths.map(p => p.value.id.name));

        for (const decoderPath of decoderPaths) {
            const decoderName = decoderPath.value.id.name;
            let decodeFn;
            try {
                decodeFn = this.evaluateDecoder(root, decoderName);
            } catch (error) {
                // Not every self-patching function is a string-array decoder (or it depends on
                // something we didn't/couldn't pull into the sandbox) - skip it rather than fail
                // the whole transform.
                continue;
            }

            const callableNames = new Set([decoderName, ...(aliasesOf.get(decoderName) || [])]);
            this.replaceDecodableCalls(root, callableNames, decodeFn);
        }

        this.removeDeadDecoderCode(root, decoderPaths, aliasesOf);
    }

    // A decoder is a 2-parameter function that reassigns its own name inside its own body
    // (the self-patching memoization idiom above). That's a distinctive enough fingerprint
    // that it doesn't collide with hand-written code.
    findDecoderFunctions(root) {
        return root
            .find(j.FunctionDeclaration)
            .filter(path => {
                const fn = path.value;
                if (!fn.id || fn.params.length !== 2) {
                    return false;
                }
                const selfName = fn.id.name;
                return j(fn.body)
                    .find(j.AssignmentExpression, {left: {type: "Identifier", name: selfName}})
                    .size() > 0;
            })
            .paths();
    }

    // Maps canonical decoder name -> Set of other identifier names that are (transitively)
    // plain aliases of it, e.g. `var _0x400480 = _0x18d7;` then later `_0x8975a2 = _0x400480;`.
    buildAliasMap(root, decoderNames) {
        const edges = new Map(); // aliasName -> targetName
        const recordAlias = (aliasName, targetName) => {
            if (aliasName !== targetName) {
                edges.set(aliasName, targetName);
            }
        };

        root.find(j.VariableDeclarator, {id: {type: "Identifier"}, init: {type: "Identifier"}})
            .forEach(path => recordAlias(path.value.id.name, path.value.init.name));

        root.find(j.AssignmentExpression, {left: {type: "Identifier"}, right: {type: "Identifier"}})
            .forEach(path => recordAlias(path.value.left.name, path.value.right.name));

        const resolve = (name, seen = new Set()) => {
            if (seen.has(name)) return name;
            seen.add(name);
            return edges.has(name) ? resolve(edges.get(name), seen) : name;
        };

        const aliasesOf = new Map(decoderNames.map(name => [name, new Set()]));
        for (const aliasName of edges.keys()) {
            const canonical = resolve(aliasName);
            if (aliasesOf.has(canonical)) {
                aliasesOf.get(canonical).add(aliasName);
            }
        }
        return aliasesOf;
    }

    // Pulls together the minimal source needed to actually run `decoderName`: itself, any
    // FunctionDeclaration it (transitively) references by name, and any plain
    // `var alias = target;` declarations bridging those references - then evaluates it in an
    // isolated sandbox and returns the live decoder function.
    evaluateDecoder(root, decoderName) {
        const functionsByName = new Map();
        root.find(j.FunctionDeclaration).forEach(path => {
            if (path.value.id) {
                functionsByName.set(path.value.id.name, path.value);
            }
        });

        const aliasDeclsByName = new Map();
        root.find(j.VariableDeclarator, {id: {type: "Identifier"}, init: {type: "Identifier"}})
            .forEach(path => aliasDeclsByName.set(path.value.id.name, path.value));

        const collected = [];
        // "Self-defending" javascript-obfuscator builds rotate the provider's array in place at
        // runtime via `(function(providerRef, checksum){ while(true){ try {...} catch { arr.push(arr.shift()); } } })(PROVIDER, N);`
        // before the decoder's first real call. Skipping that means decoding against the
        // original (unrotated) order, which silently produces wrong-but-plausible-looking
        // strings. These must run *after* all declarations but *before* the decoder is invoked.
        const rotateStatements = [];
        const visited = new Set();
        const freeIdentifierNames = (node) => {
            const names = new Set();
            j(node)
                .find(j.Identifier)
                .forEach(p => names.add(p.value.name));
            return names;
        };
        // Narrow, specific fingerprint for the rotate IIFE itself - not just "any IIFE that
        // happens to take this name as an argument" (a decoder function can legitimately be
        // passed around elsewhere too). Require a push+shift call inside a try/catch inside an
        // unconditional loop, which is the actual self-defending rotate idiom.
        // obfuscator.io renders `true` as the double-negation idiom (`!![]`) and array method
        // access via computed bracket notation (`arr['push']`) as often as dot notation, so both
        // forms need to be recognised.
        const callsMemberMethod = (bodyNode, methodName) => j(bodyNode)
            .find(j.CallExpression, {callee: {type: "MemberExpression"}})
            .filter(path => {
                const property = path.value.callee.property;
                return property.name === methodName || property.value === methodName;
            })
            .size() > 0;
        const looksLikeRotateBody = (functionExpression) => {
            const hasUnconditionalLoop = j(functionExpression.body).find(j.WhileStatement).size() > 0
                || j(functionExpression.body).find(j.ForStatement, {test: null}).size() > 0;
            const hasTryCatch = j(functionExpression.body).find(j.TryStatement).size() > 0;
            const callsPush = callsMemberMethod(functionExpression.body, "push");
            const callsShift = callsMemberMethod(functionExpression.body, "shift");
            return hasUnconditionalLoop && hasTryCatch && callsPush && callsShift;
        };
        // Variant A: `(function(providerRef, checksum){ while(...){ try{...}catch{ arr.push(arr.shift()); } } })(PROVIDER, N);`
        const findIifeRotateStatements = (targetName) => {
            const statements = [];
            root.find(j.CallExpression, {callee: {type: "FunctionExpression"}})
                .filter(path => path.value.arguments.some(arg => arg.type === "Identifier" && arg.name === targetName))
                .filter(path => looksLikeRotateBody(path.value.callee))
                .forEach(path => {
                    // Use the call itself, not whatever enclosing statement it sits in (which may
                    // be a comma-joined SequenceExpression dragging in unrelated code) - this
                    // call alone is a valid standalone statement.
                    statements.push(path.value);
                });
            return statements;
        };
        // Variant B: no wrapper IIFE at all - the provider is called directly into a local var
        // (often right inside a for-loop's own init clause) and the same rotate try/catch loop
        // sits inline in whatever function happens to contain it:
        //   for(var arr = PROVIDER();;) try {...} catch(e) { arr.push(arr.shift()); }
        const findInlineRotateStatements = (targetName) => {
            const statements = [];
            const loopPaths = [...root.find(j.ForStatement).paths(), ...root.find(j.WhileStatement).paths()];
            loopPaths.forEach(path => {
                const loop = path.value;
                const initDeclarators = loop.type === "ForStatement" && loop.init && loop.init.type === "VariableDeclaration"
                    ? loop.init.declarations
                    : [];
                const arrayVarNames = initDeclarators
                    .filter(d => d.init && d.init.type === "CallExpression"
                        && d.init.callee.type === "Identifier" && d.init.callee.name === targetName)
                    .map(d => d.id.name);
                if (arrayVarNames.length === 0) return;
                // A bare (unbraced) `for(...;;) try {} catch {}` makes loop.body itself the
                // TryStatement, which `.find()` won't match against its own root node.
                const hasTryCatch = loop.body.type === "TryStatement" || j(loop.body).find(j.TryStatement).size() > 0;
                if (!hasTryCatch) return;
                // The push/shift method names are themselves sometimes routed through another
                // decoder call (`arr[_0x400480(368)]()`), so we can't always match on the
                // literal method name - two-or-more method calls directly on the array variable,
                // inside an infinite-loop try/catch, is already an unmistakable fingerprint.
                const rotatesOneOfThem = arrayVarNames.some(name => j(loop.body)
                    .find(j.CallExpression, {callee: {type: "MemberExpression", object: {type: "Identifier", name}}})
                    .size() >= 2);
                if (rotatesOneOfThem) {
                    statements.push(loop);
                }
            });
            return statements;
        };
        const findSelfDefendingRotateStatements = (targetName) => [
            ...findIifeRotateStatements(targetName),
            ...findInlineRotateStatements(targetName),
        ];

        const queue = [decoderName];
        while (queue.length > 0) {
            const name = queue.shift();
            if (visited.has(name)) continue;
            visited.add(name);

            if (functionsByName.has(name)) {
                const fnNode = functionsByName.get(name);
                collected.push(j(fnNode).toSource());
                for (const referenced of freeIdentifierNames(fnNode)) {
                    if (!visited.has(referenced)) queue.push(referenced);
                }
                for (const rotateCallNode of findSelfDefendingRotateStatements(name)) {
                    rotateStatements.push(j(rotateCallNode).toSource() + ";");
                    for (const referenced of freeIdentifierNames(rotateCallNode)) {
                        if (referenced !== name && !visited.has(referenced)) queue.push(referenced);
                    }
                }
            } else if (aliasDeclsByName.has(name)) {
                const declarator = aliasDeclsByName.get(name);
                collected.push(`var ${declarator.id.name} = ${declarator.init.name};`);
                if (!visited.has(declarator.init.name)) queue.push(declarator.init.name);
            }
        }

        if (!visited.has(decoderName) || collected.length === 0) {
            throw new Error(`could not assemble a standalone snippet for ${decoderName}`);
        }

        // Rotate statements are discovered breadth-first outward from the decoder we actually
        // want (e.g. a module's own rotate loop is found before we walk into an *outer* decoder
        // it depends on for its push/shift method names). Whatever a rotate statement depends on
        // must itself already be correctly rotated before it runs, so dependencies discovered
        // later need to execute earlier: reverse gives that order.
        const orderedRotateStatements = [...rotateStatements].reverse();

        const sandbox = {};
        vm.createContext(sandbox);
        vm.runInContext([...collected, ...orderedRotateStatements].join("\n"), sandbox, {timeout: 2000});

        const decodeFn = sandbox[decoderName];
        if (typeof decodeFn !== "function") {
            throw new Error(`${decoderName} did not evaluate to a function`);
        }
        return decodeFn;
    }

    replaceDecodableCalls(root, callableNames, decodeFn) {
        root.find(j.CallExpression, {callee: {type: "Identifier"}})
            .filter(path => callableNames.has(path.value.callee.name))
            .filter(path => path.value.arguments.length >= 1
                && path.value.arguments[0].type === "Literal"
                && typeof path.value.arguments[0].value === "number"
                && (path.value.arguments.length === 1 || path.value.arguments[1].type === "Literal"))
            .forEach(path => {
                const args = path.value.arguments.map(a => a.value);
                let decoded;
                try {
                    decoded = decodeFn(...args);
                } catch (error) {
                    return;
                }
                if (typeof decoded === "string") {
                    j(path).replaceWith(j.literal(decoded));
                }
            });
    }

    // Best-effort cleanup: drop decoder/provider functions and alias declarations that no
    // longer have any references once every call site has been inlined.
    removeDeadDecoderCode(root, decoderPaths, aliasesOf) {
        const candidateNames = new Set();
        for (const decoderPath of decoderPaths) {
            const decoderName = decoderPath.value.id.name;
            candidateNames.add(decoderName);
            for (const alias of aliasesOf.get(decoderName) || []) {
                candidateNames.add(alias);
            }
        }

        let changed = true;
        while (changed) {
            changed = false;
            for (const name of candidateNames) {
                const referenceCount = root.find(j.Identifier, {name}).size();
                const declarationCount = root
                    .find(j.FunctionDeclaration, {id: {name}})
                    .size() + root
                    .find(j.VariableDeclarator, {id: {type: "Identifier", name}})
                    .size();
                if (referenceCount > 0 && referenceCount <= declarationCount) {
                    root.find(j.FunctionDeclaration, {id: {name}}).remove();
                    root.find(j.VariableDeclarator, {id: {type: "Identifier", name}})
                        .forEach(path => j(path.parent).size() > 0 && j(path).remove());
                    candidateNames.delete(name);
                    changed = true;
                    break;
                }
            }
        }
    }
}

module.exports = {StringArrayDecoderTransformer};
