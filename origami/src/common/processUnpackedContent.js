import { Tree } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import builtins from "../builtins/@builtins.js";

/**
 * Perform any necessary post-processing on the unpacked content of a file. This
 * lets treat the contents of various file types consistently.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
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

    // Use the parent's scope, adding any attached data.
    const parentScope = parent ? Scope.getScope(parent) : builtins;

    // If there's attached data, include it in the scope.
    const extendedScope = attachedData
      ? new Scope(attachedData, parentScope)
      : parentScope;

    const boundFn = fn.bind(extendedScope);
    return boundFn;
  } else if (
    Tree.isAsyncTree(content) &&
    !(/** @type {any} */ (content).scope)
  ) {
    const result = Object.create(content);
    result.parent = parent;
    return result;
  } else {
    return content;
  }
}
