import getMapArgument from "../utilities/getMapArgument.js";

/**
 * Returns a function that invokes the map's `get` method.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @returns {Promise<Function>}
 */
export default async function toFunction(maplike) {
  const map = await getMapArgument(maplike, "Tree.toFunction");
  return map.get.bind(map);
}
