import CacheGraph from "../../common/CacheGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Caches graph values in a storable cache.
 *
 * @param {GraphVariant} graph
 * @param {GraphVariant} [cache]
 * @param {GraphVariant} [filter]
 * @this {Explorable}
 */
export default async function cacheGraph(graph, cache, filter) {
  assertScopeIsDefined(this);
  const result = new CacheGraph(graph, cache, filter);
  /** @type {any} */ (result).scope = this;
  return result;
}

cacheGraph.usage = `@cache/graph graph, [cache], [filter]\tCaches graph values`;
cacheGraph.documentation = "https://graphorigami.org/cli/builtins.html#@cache";
