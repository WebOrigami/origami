/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
// import DeferredGraph from "../common/DeferredGraph.js";
import Scope from "../common/Scope.js";
// import StringWithGraph from "../common/StringWithGraph.js";
import { getScope, isPlainObject, keySymbol } from "../common/utilities.js";
import * as compile from "../language/compile.js";

/**
 * Load and evaluate an Origami expression from a file.
 *
 * @param {Buffer|string} buffer
 * @param {any} [key]
 * @this {AsyncDictionary|null}
 */
export default function loadOrigamiExpression(buffer, key) {
  const text = new String(buffer);
  const scope = getScope(this);
  text.toGraphable = async () => {
    // Compile the file's text as an Origami expression and evaluate it.
    const fn = compile.expression(text);
    let value = await fn.call(scope);

    // If the value is a function, wrap it such that it will use the file's
    // container as its scope. Make the calling `this` context available via a
    // `@context` ambient.
    if (typeof value === "function") {
      const fn = value;
      /** @this {AsyncDictionary|null} */
      value = function useFileScope(input) {
        const extendedScope = new Scope({ "@context": this }, scope);
        return fn.call(extendedScope, input);
      };
    }

    // Add diagnostic information to any (non-plain) object result.
    if (value && typeof value === "object" && !isPlainObject(value)) {
      value[keySymbol] = key;
    }

    return value;
  };
  // return new StringWithGraph(text, deferredGraph);
  return text;
}
