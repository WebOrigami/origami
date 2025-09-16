import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Return the number of keys in the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function length(treelike) {
  const tree = await getTreeArgument(treelike, "length");
  const keys = Array.from(await tree.keys());
  return keys.length;
}
