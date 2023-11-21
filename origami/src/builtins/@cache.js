import { cache, Tree } from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Caches tree values in a storable cache.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef  {import("@graphorigami/types").AsyncMutableTree} AsyncMutableTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @param {Treelike} sourceTreelike
 * @param {Treelike} [cacheTreelike]
 * @param {Treelike} [filterTreelike]
 * @this {AsyncTree|null}
 */
export default async function cacheBuiltin(
  sourceTreelike,
  cacheTreelike,
  filterTreelike
) {
  assertScopeIsDefined(this);

  const sourceTree = Tree.from(sourceTreelike);
  /** @type {any} */
  const cacheTree = cacheTreelike ? Tree.from(cacheTreelike) : undefined;
  const filterTree = filterTreelike ? Tree.from(filterTreelike) : undefined;

  /** @type {AsyncTree} */
  let result = cache(sourceTree, cacheTree, filterTree);
  result = Scope.treeWithScope(result, this);
  return result;
}

cacheBuiltin.usage = `@cache/tree tree, [cache], [filter]\tCaches tree values`;
cacheBuiltin.documentation =
  "https://graphorigami.org/cli/builtins.html#@cache";
