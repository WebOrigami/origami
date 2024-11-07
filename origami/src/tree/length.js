import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Return the number of keys in the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function length(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "tree:length");
  const keys = Array.from(await tree.keys());
  return keys.length;
}
length.description = "length(tree) - The tree's size (number of keys)";
