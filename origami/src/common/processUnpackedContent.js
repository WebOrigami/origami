import { Graph } from "@graphorigami/core";
import builtins from "../builtins/@builtins.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import Scope from "./Scope.js";
import { getScope, isTransformApplied, transformObject } from "./utilities.js";

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
export default function processUnpackedContent(content, parent, attachedData) {
  if (typeof content === "function") {
    // Wrap the function such to add ambients to the scope.
    const fn = content;
    const parentScope = parent ? getScope(parent) : builtins;
    /** @this {AsyncDictionary|null} */
    function extendScope(input) {
      let attachedGraph;
      if (attachedData) {
        attachedGraph = Graph.from(attachedData);
        if (!isTransformApplied(InheritScopeTransform, attachedGraph)) {
          attachedGraph = transformObject(InheritScopeTransform, attachedGraph);
        }
        let attachedAmbients = input ? { _: input } : null;
        attachedGraph.parent = new Scope(attachedAmbients, parentScope);
      }

      const baseScope = this ?? builtins;
      const extendedScope = new Scope(
        {
          "@container": parent,
          "@local": parentScope,
        },
        attachedGraph,
        baseScope
      );
      return fn.call(extendedScope, input);
    }
    extendScope.code = fn.code;
    return extendScope;
  } else if (Graph.isAsyncDictionary(content) && "parent" in content) {
    const result = Object.create(content);
    result.parent = getScope(parent);
    return result;
  } else {
    return content;
  }
}
