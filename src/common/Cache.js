import setDeep from "../builtins/setDeep.js";
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

  async get(key) {
    return this.traverse(key);
  }

  async traverse(...keys) {
    const cachedValue = await ExplorableGraph.traverse(this.cache, ...keys);
    if (cachedValue !== undefined) {
      // Cache hit
      return cachedValue;
    }

    // Cache miss
    const value = await ExplorableGraph.traverse(this.graph, ...keys);
    if (value !== undefined) {
      // Does this key match the filter?
      const matches =
        this.filter === undefined ||
        (await ExplorableGraph.traverse(this.filter, ...keys));
      if (matches) {
        // Save in cache before returning.

        // Convert keys and value to an object that can be applied.
        const updates = {};
        let current = updates;
        const lastKey = keys.pop();
        for (const key of keys) {
          current[key] = {};
          current = current[key];
        }
        current[lastKey] = value;

        await setDeep(this.cache, updates);
      }

      return value;
    }

    return undefined;
  }
}
