import * as trailingSlash from "../trailingSlash.js";
import * as args from "../utilities/args.js";
import hash from "../utilities/hash.js";
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
  const tree = await args.map(maplike, "Tree.manifest", { position: 1 });

  let result;
  if (tree.manifest) {
    // Defer to tree's own implementation
    result = await tree.manifest();
  } else {
    result = await map(tree, {
      deep: true,
      key: (value, key) => trailingSlash.remove(key),
      keyNeedsSourceValue: false,
      value: (value, key) =>
        value.manifest ? value.manifest() : hash(value, key),
    });
  }

  result = await sync(result);
  return result;
}
