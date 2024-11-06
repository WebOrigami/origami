import { ObjectTree, symbols, Tree } from "@weborigami/async-tree";
import { builtins } from "../builtins/internal.js";

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
    const base = parent ?? new ObjectTree(builtins);
    let target;
    if (attachedData) {
      target = Tree.from(attachedData);
      target.parent = base;
    } else {
      target = base;
    }
    const result = content.bind(target);
    if (content.code) {
      result.code = content.code;
    }
    return result;
  } else if (Tree.isAsyncTree(content) && !content.parent) {
    const result = Object.create(content);
    result.parent = parent;
    return result;
  } else if (Object.isExtensible(content) && !content[symbols.parent]) {
    Object.defineProperty(content, symbols.parent, {
      configurable: true,
      enumerable: false,
      value: parent,
      writable: true,
    });
    return content;
  } else {
    return content;
  }
}
