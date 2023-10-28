import { Scope } from "@graphorigami/language";
import CacheTree from "../../common/CacheTree.js";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";
/**
 * Caches tree values in a storable cache.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @param {Treelike} tree
 * @param {Treelike} [cache]
 * @param {Treelike} [filter]
 * @this {AsyncTree|null}
 */
export default async function cacheTree(tree, cache, filter) {
  assertScopeIsDefined(this);

  /** @type {AsyncTree} */
  let result = new CacheTree(tree, cache, filter);
  result = Scope.treeWithScope(result, this);
  return result;
}

cacheTree.usage = `@cache/tree tree, [cache], [filter]\tCaches tree values`;
cacheTree.documentation = "https://graphorigami.org/cli/builtins.html#@cache";
