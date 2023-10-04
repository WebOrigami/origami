/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { Graph } from "@graphorigami/core";
import builtins from "../builtins/@builtins.js";
import Scope from "../common/Scope.js";
import TextDocument from "../common/TextDocument.js";
import { getScope } from "../common/utilities.js";
import * as compile from "../language/compile.js";

/**
 * Load and evaluate an Origami expression from a file.
 *
 * @type {import("../../index.js").FileUnpackFunction}
 */
export default async function unpackOrigamiExpression(input, options = {}) {
  const { parent } = options;

  // Get the input body text.
  const inputDocument = TextDocument.from(input);
  const bodyText = inputDocument.text;

  // Compile the body text as an Origami expression and evaluate it.
  const fn = compile.expression(bodyText);
  const parentScope = parent ? getScope(parent) : builtins;
  let result = await fn.call(parentScope);

  // If the value is a function, wrap it such that it will use the file's
  // container as its scope. Make the calling `this` context available via a
  // `@callScope` ambient.
  if (typeof result === "function") {
    const fn = result;
    /** @this {AsyncDictionary|null} */
    function useContainerScope(input) {
      const extendedScope = new Scope({ "@callScope": this }, parentScope);
      return fn.call(extendedScope, input);
    }

    result = useContainerScope;
    // @ts-ignore
    result.code = fn.code;
  } else if (Graph.isAsyncDictionary(result) && "parent" in result) {
    result.parent = parentScope;
  }

  return result;
}
