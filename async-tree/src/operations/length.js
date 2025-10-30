import getTreeArgument from "../utilities/getTreeArgument.js";
import keys from "./keys.js";

/**
 * Return the number of keys in the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function length(maplike) {
  console.warn("Tree.length() is deprecated. Use Tree.size() instead.");
  const tree = await getTreeArgument(maplike, "length");
  const treeKeys = await keys(tree);
  return treeKeys.length;
}
