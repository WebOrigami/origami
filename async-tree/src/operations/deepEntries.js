import * as args from "../utilities/args.js";
import entries from "./entries.js";
import isMap from "./isMap.js";

/**
 * Return the deep nested entries in the tree as arrays of [key, value] pairs.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function deepEntries(maplike) {
  const tree = await args.map(maplike, "Tree.deepEntries");

  const treeEntries = await entries(tree);
  const result = await Promise.all(
    treeEntries.map(async ([key, value]) => {
      const resolvedValue = isMap(value) ? await deepEntries(value) : value;
      return [key, resolvedValue];
    }),
  );
  return result;
}
