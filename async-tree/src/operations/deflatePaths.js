import SyncMap from "../drivers/SyncMap.js";
import * as trailingSlash from "../trailingSlash.js";
import * as args from "../utilities/args.js";
import isMap from "./isMap.js";

/**
 * Given a tree, return a flat mapping of string paths to values.
 *
 * If a `basePath` is provided, it will be prepended to all paths in the result.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {string} [basePath]
 */
export default async function deflatePaths(maplike, basePath = "") {
  const tree = await args.map(maplike, "Tree.deflatePaths", { deep: true });
  const result = new SyncMap();
  for await (let [key, value] of tree) {
    const normalizedKey = trailingSlash.remove(key);
    const path = basePath ? `${basePath}/${normalizedKey}` : normalizedKey;
    value = await value;
    if (isMap(value)) {
      const subResult = await deflatePaths(value, path);
      for await (let [subPath, subValue] of subResult) {
        subValue = await subValue;
        result.set(subPath, subValue);
      }
    } else {
      result.set(path, value);
    }
  }
  return result;
}
