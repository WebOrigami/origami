import { Tree, cache } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Caches tree values in a storable cache.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef  {import("@weborigami/types").AsyncMutableTree} AsyncMutableTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
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
  assertScopeIsDefined(this, "cache");
  /** @type {any} */
  const cacheTree = cacheTreelike ? Tree.from(cacheTreelike) : undefined;
  /** @type {AsyncTree} */
  let result = cache(sourceTreelike, cacheTree, filterTreelike);
  result = Scope.treeWithScope(result, this);
  return result;
}

cacheBuiltin.usage = `@cache/tree tree, [cache], [filter]\tCaches tree values`;
cacheBuiltin.documentation = "https://weborigami.org/cli/builtins.html#@cache";
