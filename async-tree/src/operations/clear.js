import getTreeArgument from "../utilities/getTreeArgument.js";
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
  if ("readOnly" in tree && tree.readOnly) {
    throw new TypeError("Target must be a mutable asynchronous tree");
  }
  const treeKeys = await keys(tree);
  const promises = treeKeys.map((key) =>
    "delete" in tree
      ? /** @type {any} */ (tree).delete(key)
      : tree.set(key, undefined)
  );
  await Promise.all(promises);
  return tree;
}
