import * as trailingSlash from "../trailingSlash.js";
import hash from "../utilities/hash.js";
import from from "./from.js";
import map from "./map.js";
import sync from "./sync.js";

/**
 * Return a map whose keys are the original keys (without trailing slashes, if
 * present) and whose values are the hashes of the original values.
 *
 * @param {import("@weborigami/async-tree").Maplike} maplike
 * @returns {Promise<Map<string, string>>}
 */
export default async function manifest(maplike) {
  /** @type {any} */
  const tree = from(maplike);

  if (tree.manifest) {
    // Defer to tree's own implementation
    return tree.manifest();
  }

  const mapped = await map(tree, {
    deep: true,
    key: (value, key) => trailingSlash.remove(key),
    keyNeedsSourceValue: false,
    value: (value, key) =>
      value.manifest ? value.manifest() : hash(value, key),
  });
  const result = await sync(mapped);
  return result;
}
