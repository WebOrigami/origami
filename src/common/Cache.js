// TODO: Because this relies on FormulasObject, it should probably go in /src/app
import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Similar to Compose, but the first graph is treated as a writable cache. If
 * the key cannot be found in the cache, the other graphs are asked in turn for
 * that key. If a value is found, the value is written into the cache before
 * being returned.
 */
export default class Cache {
  /**
   * @param {Explorable|object} cache
   * @param  {Explorable|object} graph
   * @param {Explorable|object} [filter]
   */
  constructor(cache, graph, filter) {
    /** @type {any} */ this.cache = ExplorableGraph.from(cache);
    if (typeof this.cache.set !== "function") {
      throw new TypeError(
        `The first parameter to the Cache constructor must be a graph with a "set" method.`
      );
    }
    this.graph = ExplorableGraph.from(graph);
    this.filter = filter ? ExplorableGraph.from(filter) : undefined;
  }

  async *[Symbol.asyncIterator]() {
    // Use a Set to de-duplicate the keys from the graphs.
    const set = new Set();
    // We also check the cache in case the keys provided by the other graphs
    // have changed since the cache was updated.
    for (const graph of [this.cache, this.graph]) {
      for await (const key of graph) {
        if (!set.has(key)) {
          set.add(key);
          yield key;
        }
      }
    }
  }

  async get(...keys) {
    const cachedValue = await this.cache.get(...keys);
    if (cachedValue !== undefined) {
      // Cache hit
      return cachedValue;
    }

    // Cache miss
    const value = await this.graph.get(...keys);
    if (value !== undefined) {
      // Does this key match the filter?
      const matches =
        this.filter === undefined || (await this.filter.get(...keys));
      if (matches) {
        // Save in cache before returning.
        await this.cache.set(...keys, value);
      }

      return value;
    }

    return undefined;
  }
}
