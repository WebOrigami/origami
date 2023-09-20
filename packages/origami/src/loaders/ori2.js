/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import DeferredGraph from "../common/DeferredGraph.js";
import StringWithGraph from "../common/StringWithGraph.js";
import { getScope, keySymbol } from "../common/utilities.js";
import extendTemplateFn from "../framework/extendTemplateFn.js";
import * as compile from "../language/compile.js";
import execute from "../language/execute.js";
import * as ops from "../language/ops.js";

/**
 * Load and evaluate an Origami expression from a file.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {AsyncDictionary|null}
 */
export default function loadOrigamiExpression(buffer, key) {
  const text = String(buffer);
  const scope = getScope(this);
  const deferredGraph = new DeferredGraph(async () => {
    const fn = compile.expression(text);
    let value = await fn.call(scope);
    // If value is a function, bind it to the file container's scope.
    if (typeof value === "function") {
      // HACK: Patch template literal until we can do this in parser.
      if (fn.code[0] === ops.lambda && fn.code[1][0] === ops.concat) {
        /** @this {AsyncDictionary|null} */
        function templateFn() {
          return execute.call(this, fn.code[1]);
        }
        value = extendTemplateFn(templateFn, text);
      }
    }
    if (value && typeof value === "object") {
      value[keySymbol] = key;
    }
    return value;
  });
  return new StringWithGraph(text, deferredGraph);
}
