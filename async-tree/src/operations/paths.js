import * as trailingSlash from "../trailingSlash.js";
import getMapArgument from "../utilities/getMapArgument.js";
import from from "./from.js";
import isMap from "./isMap.js";
import isMaplike from "./isMaplike.js";

/**
 * Returns slash-separated paths for all values in the tree.
 *
 * The `base` argument is prepended to all paths.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {{ base?: string }} options
 */
export default async function paths(maplike, options = {}) {
  const tree = await getMapArgument(maplike, "paths");
  const base = options.base ?? "";
  const result = [];
  for await (const key of tree.keys()) {
    const separator = trailingSlash.has(base) ? "" : "/";
    const valuePath = base ? `${base}${separator}${key}` : key;
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
      // Get value
      value = await tree.get(key);
    }

    if (isMap(value)) {
      // Subtree; recurse
      const subPaths = await paths(value, { base: valuePath });
      result.push(...subPaths);
    } else {
      result.push(valuePath);
    }
  }
  return result;
}
