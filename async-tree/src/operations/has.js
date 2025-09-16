import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Returns a boolean indicating whether the specific node of the tree has a
 * value for the given `key`.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @param {any} key
 */
export default async function has(treelike, key) {
  const tree = await getTreeArgument(treelike, "has");
  const value = await tree.get(key);
  return value !== undefined;
}
