import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Return the top-level keys in the tree as an array.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function keys(treelike) {
  const tree = await getTreeArgument(treelike, "keys");
  const keys = await tree.keys();
  return Array.from(keys);
}
