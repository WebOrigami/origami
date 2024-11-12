import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Return the top-level keys in the tree as an array.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function keys(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "tree:keys");
  const keys = await tree.keys();
  return Array.from(keys);
}
