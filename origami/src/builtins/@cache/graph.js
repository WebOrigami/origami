import CacheGraph from "../../common/CacheGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Caches graph values in a storable cache.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @param {Graphable} graph
 * @param {Graphable} [cache]
 * @param {Graphable} [filter]
 * @this {AsyncDictionary|null}
 */
export default async function cacheGraph(graph, cache, filter) {
  assertScopeIsDefined(this);
  const result = new CacheGraph(graph, cache, filter);
  /** @type {any} */ (result).scope = this;
  return result;
}

cacheGraph.usage = `@cache/graph graph, [cache], [filter]\tCaches graph values`;
cacheGraph.documentation = "https://graphorigami.org/cli/builtins.html#@cache";
