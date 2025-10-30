import * as trailingSlash from "../trailingSlash.js";
import from from "./from.js";
import isAsyncTree from "./isAsyncTree.js";

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
  const tree = from(maplike);
  const base = options.base ?? "";
  const assumeSlashes = options.assumeSlashes ?? false;
  const result = [];
  for await (const key of tree.keys()) {
    const separator = trailingSlash.has(base) ? "" : "/";
    const valuePath = base ? `${base}${separator}${key}` : key;
    let isSubtree;
    let value;
    if (assumeSlashes) {
      // Subtree needs to have a trailing slash
      isSubtree = trailingSlash.has(key);
      if (isSubtree) {
        // We'll need the value to recurse
        value = await tree.get(key);
      }
    } else {
      // Get value and check
      value = await tree.get(key);
    }
    if (value) {
      // If we got the value we can check if it's a subtree
      isSubtree = isAsyncTree(value);
    }
    if (isSubtree) {
      const subPaths = await paths(value, { assumeSlashes, base: valuePath });
      result.push(...subPaths);
    } else {
      result.push(valuePath);
    }
  }
  return result;
}
