import from from "./from.js";

/**
 * Returns a function that invokes the tree's `get` method.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @returns {Function}
 */
export default function toFunction(treelike) {
  const tree = from(treelike);
  return tree.get.bind(tree);
}
