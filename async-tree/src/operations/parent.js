import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Returns the parent of the current tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function parent(treelike) {
  const tree = await getTreeArgument(treelike, "parent");
  return "parent" in tree ? tree.parent : undefined;
}
