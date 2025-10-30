import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Returns an array of `[key, value]` for each entry in the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @returns {Promise<Array<[any, any]>>}
 */
export default async function entries(maplike) {
  const tree = await getTreeArgument(maplike, "entries");
  if (tree instanceof Map) {
    return Array.from(tree.entries());
  } else {
    // AsyncMap
    const result = [];
    for await (const entry of tree) {
      result.push(entry);
    }
    return result;
  }
}
