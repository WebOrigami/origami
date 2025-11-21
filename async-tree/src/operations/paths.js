import * as trailingSlash from "../trailingSlash.js";
import getMapArgument from "../utilities/getMapArgument.js";
import isMap from "./isMap.js";

/**
 * Returns slash-separated paths for all values in the tree.
 *
 * The `base` argument is prepended to all paths.
 *
 * If `assumeSlashes` is true, then keys are assumed to have trailing slashes to
 * indicate subtrees. The default value of this option is false.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {{ assumeSlashes?: boolean, base?: string }} options
 */
export default async function paths(maplike, options = {}) {
  const tree = await getMapArgument(maplike, "paths");
  const base = options.base ?? "";
  const result = [];
  for await (const key of tree.keys()) {
    const separator = trailingSlash.has(base) ? "" : "/";
    const valuePath = base ? `${base}${separator}${key}` : key;
    let isSubtree;
    let value;
    if (/** @type {any} */ (tree).trailingSlashKeys) {
      // Subtree needs to have a trailing slash
      if (trailingSlash.has(key)) {
        // We'll need the value to recurse
        value = await tree.get(key);
      }
    } else {
      // Get value and check
      value = await tree.get(key);
    }
    if (value) {
      // If we got the value we can check if it's a subtree
      isSubtree = isMap(value);
    }
    if (isSubtree) {
      const subPaths = await paths(value, { base: valuePath });
      result.push(...subPaths);
    } else {
      result.push(valuePath);
    }
  }
  return result;
}
