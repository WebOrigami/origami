import { Graph } from "@graphorigami/core";
import builtins from "../builtins/@builtins.js";
import Scope from "./Scope.js";
import { getScope } from "./utilities.js";

/**
 * Perform any necessary post-processing on the unpacked content of a file. This
 * lets treat the contents of various file types consistently.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 *
 * @param {any} content
 * @param {AsyncDictionary|null} parent
 * @param {any} [attachedData]
 * @returns
 */
export function processUnpackedContent(content, parent, attachedData) {
  if (typeof content === "function") {
    // Wrap the function such to add ambients to the scope.
    const fn = content;
    const parentScope = parent ? getScope(parent) : builtins;
    /** @this {AsyncDictionary|null} */
    function useContainerScope(input) {
      const extendedScope = new Scope(
        {
          "@container": parent,
          "@callScope": this,
          "@attached": attachedData,
        },
        parentScope
      );
      return fn.call(extendedScope, input);
    }
    useContainerScope.code = fn.code;
    return useContainerScope;
  } else if (Graph.isAsyncDictionary(content) && "parent" in content) {
    const result = Object.create(content);
    result.parent = getScope(parent);
    return result;
  } else {
    return content;
  }
}
