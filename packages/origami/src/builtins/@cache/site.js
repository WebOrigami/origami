import CacheSite from "../../common/CacheSite.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Caches fetch requests for a standard site.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @param {GraphVariant} graph
 * @param {GraphVariant} [cache]
 * @param {GraphVariant} [filter]
 * @this {AsyncDictionary|null}
 */
export default async function cacheSite(graph, cache, filter) {
  assertScopeIsDefined(this);
  const result = new CacheSite(graph, cache, filter);
  /** @type {any} */ (result).scope = this;
  return result;
}

cacheSite.usage = `@cache/site site, [cache], [filter]\tCaches site fetch requests`;
cacheSite.documentation = "https://graphorigami.org/cli/builtins.html#@cache";
