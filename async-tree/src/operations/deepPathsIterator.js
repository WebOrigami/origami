import * as trailingSlash from "../trailingSlash.js";
import * as args from "../utilities/args.js";
import isMaplike from "./isMaplike.js";
import keys from "./keys.js";

/**
 * Return an iterator that yields slash-separated paths for all leaf values in
 * the deep tree.
 *
 * @param {import("../../index.ts").Maplike} maplike
 * @param {string} [basePath]
 * @returns {AsyncGenerator<string, void, undefined>}
 */
export default async function* deepPathsIterator(maplike, basePath = "") {
  const tree = await args.map(maplike, "Tree.deepPathsIterator", {
    deep: true,
  });

  for (const key of await keys(tree)) {
    const separator = trailingSlash.has(basePath) ? "" : "/";
    const path = basePath ? `${basePath}${separator}${key}` : key;
    if (trailingSlash.has(key)) {
      const value = await tree.get(key);
      if (isMaplike(value)) {
        yield* deepPathsIterator(value, path);
      }
    } else {
      yield path;
    }
  }
}
