import getTreeArgument from "../utilities/getTreeArgument.js";
import isAsyncMutableTree from "./isAsyncMutableTree.js";
import keys from "./keys.js";

/**
 * Remove all entries from the tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function clear(treelike) {
  const tree = await getTreeArgument(treelike, "clear");
  if (!isAsyncMutableTree(tree)) {
    throw new TypeError("clear: can't clear a read-only tree.");
  }
  const treeKeys = Array.from(await keys(tree));
  const promises = treeKeys.map((key) =>
    "delete" in tree
      ? /** @type {any} */ (tree).delete(key)
      : tree.set(key, undefined)
  );
  await Promise.all(promises);
  return tree;
}
