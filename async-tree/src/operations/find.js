import * as args from "../utilities/args.js";

/**
 * Return the first value in the map that satisfies the given predicate
 * function.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {Function} predicate
 */
export default async function find(maplike, predicate) {
  const map = await args.map(maplike, "Tree.find");
  for await (const key of map.keys()) {
    const value = await map.get(key);
    if (await predicate(value, key, map)) {
      return value;
    }
  }
  return undefined;
}
