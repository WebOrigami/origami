import from from "./from.js";
import isAsyncMutableTree from "./isAsyncMutableTree.js";

/**
 * Remove all entries from the tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function clear(treelike) {
  const tree = from(treelike);
  if (!isAsyncMutableTree(tree)) {
    throw new TypeError("clear: can't clear a read-only tree.");
  }
  const keys = Array.from(await tree.keys());
  const promises = keys.map((key) => tree.set(key, undefined));
  await Promise.all(promises);
  return tree;
}
