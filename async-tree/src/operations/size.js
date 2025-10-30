import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Return the number of keys in the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function size(treelike) {
  const tree = await getTreeArgument(treelike, "size");
  return tree.size;
}
