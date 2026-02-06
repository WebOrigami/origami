import getMapArgument from "../utilities/getMapArgument.js";
import keys from "./keys.js";

/**
 * Return the number of keys in the tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function length(maplike) {
  console.warn("Tree.length() is deprecated. Use Tree.size() instead.");
  const tree = await getMapArgument(maplike, "Tree.length");
  const treeKeys = await keys(tree);
  return treeKeys.length;
}
