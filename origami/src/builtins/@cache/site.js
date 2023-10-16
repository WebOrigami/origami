import CacheSite from "../../common/CacheSite.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Caches fetch requests for a standard site.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @param {Treelike} tree
 * @param {Treelike} [cache]
 * @param {Treelike} [filter]
 * @this {AsyncDictionary|null}
 */
export default async function cacheSite(tree, cache, filter) {
  assertScopeIsDefined(this);
  const result = new CacheSite(tree, cache, filter);
  /** @type {any} */ (result).scope = this;
  return result;
}

cacheSite.usage = `@cache/site site, [cache], [filter]\tCaches site fetch requests`;
cacheSite.documentation = "https://graphorigami.org/cli/builtins.html#@cache";
