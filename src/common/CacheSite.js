import setDeep from "../builtins/@graph/setDeep.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import ObjectGraph from "../core/ObjectGraph.js";

/**
 * Caches the results retrieved from one source graph in a second cache graph.
 * The second cache graph is consulted first.
 */
export default class CacheSite {
  /**
   * @param  {Explorable|object} graph
   * @param {Explorable|object} [cache]
   * @param {Explorable|object} [filter]
   */
  constructor(graph, cache, filter) {
    this.graph = ExplorableGraph.from(graph);

    if (cache === undefined) {
      this.cache = new ObjectGraph({});
    } else {
      /** @type {any} */ this.cache = ExplorableGraph.from(cache);
      if (typeof this.cache.set !== "function") {
        throw new TypeError(
          `The first parameter to the Cache constructor must be a graph with a "set" method.`
        );
      }
    }

    this.filter = filter ? ExplorableGraph.from(filter) : undefined;
  }

  async get(key) {
    return this.traverse(key);
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
