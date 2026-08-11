import * as trailingSlash from "../trailingSlash.js";
import * as args from "../utilities/args.js";
import from from "./from.js";
import isMap from "./isMap.js";
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

    let value;
    if (/** @type {any} */ (tree).trailingSlashKeys) {
      // Subtree needs to have a trailing slash
      if (trailingSlash.has(key)) {
        // We'll need the value to recurse
        value = await tree.get(key);
        // If it's maplike, treat as subtree
        if (isMaplike(value)) {
          value = from(value);
        }
      }
    } else {
      // Need to get the value to see if it's a subtree
      value = await tree.get(key);
    }

    if (isMap(value)) {
      yield* deepPathsIterator(value, path);
    } else {
      yield path;
    }
  }
}
