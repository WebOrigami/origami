import { Tree } from "@weborigami/async-tree";
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
    // Bind the function to a target that's the attached data (if it exists) or
    // the parent.
    const base = parent ?? builtins;
    let target;
    if (attachedData) {
      target = Tree.from(attachedData);
      target.parent = base;
    } else {
      target = base;
    }
    return content.bind(target);
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
