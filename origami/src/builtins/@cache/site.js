import CacheSite from "../../common/CacheSite.js";
import { treeWithScope } from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Caches fetch requests for a standard site.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @param {Treelike} tree
 * @param {Treelike} [cache]
 * @param {Treelike} [filter]
 * @this {AsyncTree|null}
 */
export default async function cacheSite(tree, cache, filter) {
  assertScopeIsDefined(this);
  /** @type {AsyncTree} */
  let result = new CacheSite(tree, cache, filter);
  result = treeWithScope(result, this);
  return result;
}

cacheSite.usage = `@cache/site site, [cache], [filter]\tCaches site fetch requests`;
cacheSite.documentation = "https://graphorigami.org/cli/builtins.html#@cache";
