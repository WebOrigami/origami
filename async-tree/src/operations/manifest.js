import * as trailingSlash from "../trailingSlash.js";
import * as args from "../utilities/args.js";
import hash from "../utilities/hash.js";
import isMaplike from "./isMaplike.js";
import map from "./map.js";
import resolve from "./resolve.js";

/**
 * Return a map whose keys are the original keys (without trailing slashes, if
 * present) and whose values are the hashes of the original values.
 *
 * @param {import("../../index.ts").Maplike} maplike
 * @returns {Promise<Map<string, string>>}
 */
export default async function manifest(maplike) {
  const tree = await args.map(maplike, "Tree.manifest", {
    deep: true,
    position: 1,
  });

  let result;
  if (/** @type {any} */ (tree).manifest) {
    // Defer to tree's own implementation
    result = await /** @type {any} */ (tree).manifest();
  } else {
    result = await map(tree, {
      deep: true,
      key: (value, key) => trailingSlash.remove(key),
      keyNeedsSourceValue: false,
      value: async (value, key) =>
        isMaplike(value) ? await manifest(value) : hash(value, key),
    });
  }

  result = await resolve(result);
  return result;
}
