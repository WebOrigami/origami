import { symbols, Tree } from "@weborigami/async-tree";
import { builtinsTree } from "../internal.js";

/**
 * Perform any necessary post-processing on the unpacked content of a file. This
 * lets treat the contents of various file types consistently.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {any} content
 * @param {AsyncTree|null} parent
 * @returns
 */
export default function processUnpackedContent(content, parent) {
  if (typeof content === "function") {
    // Bind the function to the parent as the `this` context.
    const target = parent ?? builtinsTree;
    const result = content.bind(target);
    // Copy over any properties that were attached to the function
    Object.assign(result, content);
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
