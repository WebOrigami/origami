import * as args from "../utilities/args.js";

/**
 * Remove all entries from the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function clear(maplike) {
  const map = await args.map(maplike, "Tree.clear");

  // Call the map's own clear() method
  await map.clear();

  // Return the standard map for convenience, even though the standard clear()
  // method doesn't.
  return map;
}
