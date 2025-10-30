import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Returns the parent of the current tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function parent(maplike) {
  const tree = await getTreeArgument(maplike, "parent");
  return "parent" in tree ? tree.parent : undefined;
}
