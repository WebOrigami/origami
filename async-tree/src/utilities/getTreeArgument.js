import from from "../operations/from.js";
import isUnpackable from "./isUnpackable.js";

/**
 * Convert the indicated argument to a tree, or throw an exception.
 *
 * Tree operations can use this to validate the tree argument and provide more
 * helpful error messages. This also unpacks a unpackable tree argument so that
 * the caller can work with a simpler tree instead of a DeferredTree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 * @typedef {import("../../index.ts").Unpackable} Unpackable
 *
 * @param {Treelike|Unpackable} treelike
 * @param {string} operation
 * @param {{ deep?: boolean, position?: number }} [options]
 * @returns {Promise<AsyncTree>}
 */
export default async function getTreeArgument(
  treelike,
  operation,
  options = {}
) {
  const deep = options.deep;
  const position = options.position ?? 0;

  if (isUnpackable(treelike)) {
    treelike = await treelike.unpack();
  }

  let tree;
  try {
    tree = from(treelike, { deep });
  } catch (/** @type {any} */ error) {
    let message = error.message ?? error;
    message = `${operation}: ${message}`;
    const newError = new TypeError(message);
    /** @type {any} */ (newError).position = position;
    throw newError;
  }
  return tree;
}
