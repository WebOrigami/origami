/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { Graph } from "@graphorigami/core";
import DeferredGraph from "../common/DeferredGraph.js";
import StringWithGraph from "../common/StringWithGraph.js";
import { getScope, graphInContext, keySymbol } from "../common/utilities.js";
import * as compile from "../language/compile.js";
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
      // HACK: Is the function for a template literal?
      if (fn.code[0] === ops.lambda && fn.code[1][0] === ops.concat) {
        // Yes: create cheap version of what Template does.
        const templateFn = value;
        value = async function (input) {
          const extendedScope = Graph.isGraphable(input)
            ? graphInContext(input, this)
            : this;
          return templateFn.call(extendedScope);
        };
      }
      value = value.bind(scope);
    }
    if (value && typeof value === "object") {
      value[keySymbol] = key;
    }
    return value;
  });
  return new StringWithGraph(text, deferredGraph);
}
