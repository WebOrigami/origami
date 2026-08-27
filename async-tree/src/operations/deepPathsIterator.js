import * as trailingSlash from "../trailingSlash.js";
import * as args from "../utilities/args.js";
import isMaplike from "./isMaplike.js";
import keys from "./keys.js";

/**
 * Return an iterator that yields slash-separated paths for all leaf values in
 * the deep tree.
 *
 * @param {import("../../index.ts").Maplike} maplike
 * @param {{ assumeSlashKeys?: boolean, base?: string }} options
 * @returns {AsyncGenerator<string, void, undefined>}
 */
export default async function* deepPathsIterator(maplike, options = {}) {
  const assumeSlashKeys = options.assumeSlashKeys ?? false;

  if (typeof options === "string") {
    console.warn(
      "Warning: Passing a base path string as the second argument is deprecated. Use an options object with a `base` property instead.",
    );
    options = { base: options };
  }

  const basePath = options.base ?? "";
  const tree = await args.map(maplike, "Tree.deepPathsIterator", {
    deep: true,
  });
  const trailingSlashKeys =
    /** @type {any} */ (tree).trailingSlashKeys ?? false;

  for (const key of await keys(tree)) {
    const separator = trailingSlash.has(basePath) ? "" : "/";
    const path = basePath ? `${basePath}${separator}${key}` : key;

    let value;
    let isLeaf;
    // If assumeSlashKeys is true, and the tree supports trailingSlashes, but
    // the key does not have a slash, then we assume the value isn't maplike and
    // can skip the potentially expensive operation of getting the value.
    if (assumeSlashKeys && trailingSlashKeys && !trailingSlash.has(key)) {
      isLeaf = true;
    } else {
      // If we can't rely on slash keys, we need to get the value to see if it's
      // a subtree. If we can rely on slash keys, we already know the value will
      // be a subtree, but we need to get the value anyway in order to recurse.
      value = await tree.get(key);
      isLeaf = !isMaplike(value);
    }

    if (isLeaf) {
      yield path;
    } else {
      yield* deepPathsIterator(value, { ...options, base: path });
    }
  }
}
