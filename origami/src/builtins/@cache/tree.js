import CacheTree from "../../common/CacheTree.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Caches tree values in a storable cache.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @param {Treelike} tree
 * @param {Treelike} [cache]
 * @param {Treelike} [filter]
 * @this {AsyncDictionary|null}
 */
export default async function cacheTree(tree, cache, filter) {
  assertScopeIsDefined(this);
  const result = new CacheTree(tree, cache, filter);
  /** @type {any} */ (result).scope = this;
  return result;
}

cacheTree.usage = `@cache/tree tree, [cache], [filter]\tCaches tree values`;
cacheTree.documentation = "https://graphorigami.org/cli/builtins.html#@cache";
