import getMapArgument from "../utilities/getMapArgument.js";

/**
 * Return the number of keys in the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function size(maplike) {
  const map = await getMapArgument(maplike, "Tree.size");
  return map.size;
}
