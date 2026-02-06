import * as args from "../utilities/args.js";

/**
 * Returns an array of `[key, value]` for each entry in the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @returns {Promise<Array<[any, any]>>}
 */
export default async function entries(maplike) {
  const map = await args.map(maplike, "Tree.entries");
  if (map instanceof Map) {
    return Array.from(map.entries());
  } else {
    // AsyncMap
    const result = [];
    for await (const entry of map) {
      result.push(entry);
    }
    return result;
  }
}
