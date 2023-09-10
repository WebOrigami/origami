import {
  DictionaryHelpers,
  GraphHelpers,
  ObjectGraph,
} from "@graphorigami/core";
import setDeep from "../builtins/@graph/setDeep.js";

/**
 * Caches the results retrieved from one source graph in a second cache graph.
 * The second cache graph is consulted first.
 */
export default class CacheSite {
  /**
   * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
   * @param {GraphVariant} graph
   * @param {GraphVariant} [cache]
   * @param {GraphVariant} [filter]
   */
  constructor(graph, cache, filter) {
    this.graph = GraphHelpers.from(graph);

    if (cache === undefined) {
      this.cache = new ObjectGraph({});
    } else {
      /** @type {any} */ this.cache = GraphHelpers.from(cache);
      if (typeof this.cache.set !== "function") {
        throw new TypeError(
          `The first parameter to the Cache constructor must be a graph with a "set" method.`
        );
      }
    }

    this.filter = filter ? GraphHelpers.from(filter) : undefined;
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
    if (keys.length === 0 || keys[0] === undefined) {
      return this;
    }

    let cacheValue = await GraphHelpers.traverse(this.cache, ...keys);
    if (
      cacheValue !== undefined &&
      !DictionaryHelpers.isAsyncDictionary(cacheValue)
    ) {
      // Non-graph cache hit
      return cacheValue;
    }

    // Cache miss
    let value = await GraphHelpers.traverse(this.graph, ...keys);
    if (value !== undefined) {
      // Does this key match the filter?
      let match;
      let filterValue;
      if (this.filter === undefined) {
        match = true;
      } else {
        filterValue = await GraphHelpers.traverse(this.filter, ...keys);
        match = filterValue !== undefined;
      }
      if (match) {
        // Save in cache before returning.

        // Convert keys and value to an object that can be applied.
        const updates = {};
        let current = updates;
        const lastKey = keys.pop();
        for (const key of keys) {
          current[key] = {};
          current = current[key];
        }
        // If we have a graph value, we don't cache the entire thing, just an
        // empty graph.
        current[lastKey] = DictionaryHelpers.isAsyncDictionary(value)
          ? {}
          : value;

        // TODO: setDeep() should return the value it set.
        await setDeep(this.cache, updates);
        cacheValue = await GraphHelpers.traverse(this.cache, ...keys, lastKey);
      }

      if (DictionaryHelpers.isAsyncDictionary(value)) {
        // Construct merged graph for a graph result.
        value = Reflect.construct(this.constructor, [
          value,
          cacheValue,
          filterValue,
        ]);
      }

      return value;
    }

    return undefined;
  }
}
