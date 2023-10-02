/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import builtins from "../builtins/@builtins.js";
import Scope from "../common/Scope.js";
import TextFile from "../common/TextFile.js";
import { getScope } from "../common/utilities.js";
import * as compile from "../language/compile.js";

/**
 * Load and evaluate an Origami expression from a file.
 *
 * @type {import("../../index.js").FileLoaderFunction}
 */
export default function loadOrigamiExpression(container, input, key) {
  const containerScope = getScope(container) ?? builtins;
  let contents;
  return new TextFile(input, async () => {
    if (contents === undefined) {
      // Compile the file's text as an Origami expression and evaluate it.
      const fn = compile.expression(String(input));
      contents = await fn.call(containerScope);

      // If the value is a function, wrap it such that it will use the file's
      // container as its scope. Make the calling `this` context available via a
      // `@callScope` ambient.
      if (typeof contents === "function") {
        const fn = contents;
        /** @this {AsyncDictionary|null} */
        function useContainerScope(input) {
          const extendedScope = new Scope(
            { "@callScope": this },
            containerScope
          );
          return fn.call(extendedScope, input);
        }

        contents = useContainerScope;
        // @ts-ignore
        contents.code = fn.code;
      }

      if (contents && typeof contents === "object") {
        if ("parent" in contents) {
          contents.parent = containerScope;
        }
      }
    }
    return contents;
  });
}
