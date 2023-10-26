import CacheTree from "../../common/CacheTree.js";
import { treeWithScope } from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Caches tree values in a storable cache.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @param {Treelike} tree
 * @param {Treelike} [cache]
 * @param {Treelike} [filter]
 * @this {AsyncTree|null}
 */
export default async function cacheTree(tree, cache, filter) {
  assertScopeIsDefined(this);

  /** @type {AsyncTree} */
  let result = new CacheTree(tree, cache, filter);
  if (this) {
    result = treeWithScope(result, this);
  }
  return result;
}

cacheTree.usage = `@cache/tree tree, [cache], [filter]\tCaches tree values`;
cacheTree.documentation = "https://graphorigami.org/cli/builtins.html#@cache";
