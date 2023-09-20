/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import DeferredGraph from "../common/DeferredGraph.js";
import StringWithGraph from "../common/StringWithGraph.js";
import { getScope, keySymbol } from "../common/utilities.js";
import * as compile from "../language/compile.js";

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
    // Compile the file's text as an Origami expression and evaluate it.
    const fn = compile.expression(text);
    const value = await fn.call(scope);
    // Add diagnostic information to any object result.
    if (value && typeof value === "object") {
      value[keySymbol] = key;
    }
    return value;
  });
  return new StringWithGraph(text, deferredGraph);
}
