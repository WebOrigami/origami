import Cache from "../common/Cache.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Caches graph values in a storable cache.
 *
 * @param {GraphVariant} graph
 * @param {GraphVariant} [cache]
 * @param {GraphVariant} [filter]
 * @this {Explorable}
 */
export default async function cacheCommand(graph, cache, filter) {
  assertScopeIsDefined(this);
  const result = new Cache(graph, cache, filter);
  /** @type {any} */ (result).scope = this;
  return result;
}

cacheCommand.usage = `cache graph, [cache], [filter]\tCaches graph values in a storable cache`;
cacheCommand.documentation = "https://graphorigami.org/cli/builtins.html#cache";
