/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { FunctionGraph, Graph, ObjectGraph } from "@graphorigami/core";
import DeferredGraph from "../common/DeferredGraph.js";
import StringWithGraph from "../common/StringWithGraph.js";
import { getScope, graphInContext, keySymbol } from "../common/utilities.js";
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
export default function loadGraph(buffer, key) {
  const text = String(buffer);
  const scope = getScope(this);
  const deferredGraph = new DeferredGraph(async () => {
    const fn = compile.expression(text);
    let value = await fn.call(scope);
    // Return graphs as is, wrap functions in a FunctionGraph, and wrap anything
    // else in a a graph whose default value is the expression's value.
    if (fn.code[0] === ops.lambda && fn.code[1][0] === ops.concat) {
      // HACK: Create cheap version of what Template does
      const func = async (input) => {
        const extendedScope = Graph.isGraphable(input)
          ? graphInContext(input, scope)
          : scope;
        const template = fn.code[1];
        return await execute.call(extendedScope, template);
      };
      value = new FunctionGraph(func);
    } else if (typeof value === "function") {
      value = new FunctionGraph(fn.bind(scope));
    } else if (!Graph.isAsyncDictionary(value)) {
      value = new ObjectGraph({ "": value });
    }
    value[keySymbol] = key;
    return value;
  });
  return new StringWithGraph(text, deferredGraph);
}
