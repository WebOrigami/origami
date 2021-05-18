import ExplorableGraph from "../core/ExplorableGraph.js";
import IStorableGraph from "../core/IStorableGraph.js";
import { explore } from "../core/utilities.js";

/**
 * Similar to Compose, but the first graph is treated as a writable cache. If
 * the key cannot be found in the cache, the other graphs are asked in turn for
 * that key. If a value is found, the value is written into the cache before
 * being returned.
 */
export default class Cache extends ExplorableGraph {
  /**
   * @param {IStorableGraph} cache
   * @param  {...any} graphs
   */
  constructor(cache, ...graphs) {
    super();
    this.cache = explore(cache);
    this.graphs = graphs.map((graph) => explore(graph));
  }

  async *[Symbol.asyncIterator]() {
    // Use a Set to de-duplicate the keys from the graphs.
    const set = new Set();
    // We also check the cache in case the set of keys provided by the other
    // graphs have changed since the cache was updated.
    for (const graph of [this.cache, ...this.graphs]) {
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
    for (const graph of this.graphs) {
      const value = await graph.get(...keys);
      if (value !== undefined) {
        // Save in cache before returning.
        await this.cache.set(...keys, value);
        return value;
      }
    }

    return undefined;
  }
}
