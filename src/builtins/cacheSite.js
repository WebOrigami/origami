import CacheSite from "../common/CacheSite.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Caches graph values in a storable cache.
 *
 * @param {GraphVariant} graph
 * @param {GraphVariant} [cache]
 * @param {GraphVariant} [filter]
 * @this {Explorable}
 */
export default async function cacheSite(graph, cache, filter) {
  assertScopeIsDefined(this);
  const result = new CacheSite(graph, cache, filter);
  /** @type {any} */ (result).scope = this;
  return result;
}

cacheSite.usage = `cacheSite site, [cache], [filter]\tCaches site values in a storable cache`;
cacheSite.documentation =
  "https://graphorigami.org/cli/builtins.html#cacheSite";
