import getMapArgument from "../utilities/getMapArgument.js";

/**
 * Returns the parent of the map, if any.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function parent(maplike) {
  const map = await getMapArgument(maplike, "Tree.parent");
  return "parent" in map ? map.parent : undefined;
}
