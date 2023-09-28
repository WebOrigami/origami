/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import builtins from "../builtins/@builtins.js";
import Scope from "../common/Scope.js";
import TextWithContents from "../common/TextWithContents.js";
import { getScope, isPlainObject, keySymbol } from "../common/utilities.js";
import * as compile from "../language/compile.js";

/**
 * Load and evaluate an Origami expression from a file.
 *
 * @param {import("../../index.js").StringLike} buffer
 * @param {any} [key]
 * @this {AsyncDictionary|null}
 */
export default function loadOrigamiExpression(buffer, key) {
  const scope = this ? getScope(this) : builtins;
  return new TextWithContents(buffer, async () => {
    // Compile the file's text as an Origami expression and evaluate it.
    const fn = compile.expression(String(buffer));
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
      value.code = fn.code;
    }

    if (value && typeof value === "object") {
      if ("parent" in value) {
        value.parent = scope;
      }
      if (!isPlainObject(value)) {
        // Add diagnostic information to any (non-plain) object result.
        value[keySymbol] = key;
      }
    }

    return value;
  });
}
