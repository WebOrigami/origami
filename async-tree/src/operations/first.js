import * as args from "../utilities/args.js";

/**
 * Return the first value in the tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function first(maplike) {
  const map = await args.map(maplike, "Tree.first");
  let firstKey;
  for await (const key of map.keys()) {
    // Just needed to get first key
    firstKey = key;
    break;
  }
  const value = firstKey ? await map.get(firstKey) : undefined;
  return value;
}
