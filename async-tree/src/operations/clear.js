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
  if ("readOnly" in map && map.readOnly) {
    throw new TypeError("Tree.clear: target map is read-only");
  }
  const promises = [];
  for await (const key of map.keys()) {
    promises.push(map.delete(key));
  }
  await Promise.all(promises);
  return map;
}
