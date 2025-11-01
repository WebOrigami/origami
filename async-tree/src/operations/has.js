import getMapArgument from "../utilities/getMapArgument.js";

/**
 * Returns true if the map has the given key, false otherwise.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {any} key
 */
export default async function has(maplike, key) {
  const map = await getMapArgument(maplike, "has");
  return map.has(key);
}
