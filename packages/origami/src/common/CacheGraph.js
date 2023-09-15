import { Dictionary, Graph, ObjectGraph } from "@graphorigami/core";

/**
 * Caches non-graph values from the first (source) graph in a second (cache)
 * graph. If no second graph is supplied, an in-memory cache is used.
 */
export default class CacheGraph {
  /**
   * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
   * @param {GraphVariant} graph
   * @param {GraphVariant} [cache]
   * @param {GraphVariant} [filter]
   */
  constructor(graph, cache, filter) {
    this.graph = Graph.from(graph);

    if (cache === undefined) {
      this.cache = new ObjectGraph({});
    } else {
      /** @type {any} */ this.cache = Graph.from(cache);
      if (typeof this.cache.set !== "function") {
        throw new TypeError(
          `The first parameter to the Cache constructor must be a graph with a "set" method.`
        );
      }
    }

    this.filter = filter ? Graph.from(filter) : undefined;
  }

  async get(key) {
    // Check cache graph first.
    let cacheValue = await this.cache.get(key);
    if (cacheValue !== undefined && !Dictionary.isAsyncDictionary(cacheValue)) {
      // Non-graph cache hit
      return cacheValue;
    }

    // Cache miss or graph cache hit.
    let value = await this.graph.get(key);
    if (value !== undefined) {
      // Does this key match the filter?
      let match;
      let filterValue;
      if (this.filter === undefined) {
        match = true;
      } else {
        filterValue = await this.filter.get(key);
        match = filterValue !== undefined;
      }
      if (match) {
        if (Dictionary.isAsyncDictionary(value)) {
          // Construct merged graph for a graph result.
          if (cacheValue === undefined) {
            // Construct new container in cache
            // TODO: .set() should return the value it set.
            await this.cache.set(key, {});
            cacheValue = await this.cache.get(key);
          }
          value = Reflect.construct(this.constructor, [
            value,
            cacheValue,
            filterValue,
          ]);
        } else {
          // Save in cache before returning.
          await this.cache.set(key, value);
        }
      }

      return value;
    }

    return undefined;
  }

  async keys() {
    // We also check the cache in case the keys provided by the other graphs
    // have changed since the cache was updated.
    const keys = new Set(await this.cache.keys());
    for (const key of await this.graph.keys()) {
      keys.add(key);
    }
    return keys;
  }
}
