import { Tree } from "@graphorigami/core";
import builtins from "../builtins/@builtins.js";
import Scope from "../runtime/Scope.js";
import { getScope, treeWithScope } from "./utilities.js";

/**
 * Perform any necessary post-processing on the unpacked content of a file. This
 * lets treat the contents of various file types consistently.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 *
 * @param {any} content
 * @param {AsyncTree|null} parent
 * @param {any} [attachedData]
 * @returns
 */
export default function processUnpackedContent(content, parent, attachedData) {
  if (typeof content === "function") {
    // Wrap the function such to add ambients to the scope.
    const fn = content;
    const parentScope = parent ? getScope(parent) : builtins;

    /** @this {AsyncTree|null} */
    async function extendScope(input, ...rest) {
      let attachedTree;
      if (attachedData) {
        // Give the attached tree access to the input.
        const ambientTree = treeWithScope({ _: input }, parentScope);
        attachedTree = treeWithScope(attachedData, ambientTree.scope);
      }
      const extendedScope = new Scope(attachedTree, parentScope);
      return fn.call(extendedScope, input, ...rest);
    }

    extendScope.code = fn.code;
    return extendScope;
  } else if (Tree.isAsyncTree(content)) {
    const result = Object.create(content);
    result.parent = parent;
    return result;
  } else {
    return content;
  }
}
