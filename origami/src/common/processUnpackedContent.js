import { Tree } from "@graphorigami/core";
import { Scope } from "@graphorigami/language";
import builtins from "../builtins/@builtins.js";

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
    const parentScope = parent ? Scope.getScope(parent) : builtins;

    /** @this {AsyncTree|null} */
    async function extendScope(input, ...rest) {
      let attachedTree;
      if (attachedData) {
        // Give the attached tree access to the input.
        const ambientTree = Scope.treeWithScope({ _: input }, parentScope);
        attachedTree = Scope.treeWithScope(attachedData, ambientTree.scope);
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
