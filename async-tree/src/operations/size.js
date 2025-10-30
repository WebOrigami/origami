import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Return the number of keys in the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function size(maplike) {
  const tree = await getTreeArgument(maplike, "size");
  return tree.size;
}
