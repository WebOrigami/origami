import { asyncGet, asyncKeys, asyncSet } from "@explorablegraph/symbols";
import AsyncExplorable from "./AsyncExplorable.js";

/**
 * Similar to Compose, but the first graph is treated as a writable cache. If
 * the key cannot be found in the cache, the other graphs are asked in turn for
 * that key. If a value is found, the value is written into the cache before
 * being returned.
 */
export default class Cache extends AsyncExplorable {
  constructor(cache, ...graphs) {
    super();
    this.cache = cache;
    this.graphs = graphs.map((graph) => AsyncExplorable(graph));
  }

  async [asyncGet](...keys) {
    const cachedValue = await this.cache[asyncGet](...keys);
    if (cachedValue) {
      // Cache hit
      return cachedValue;
    }

    // Cache miss
    for (const graph of this.graphs) {
      const value = await graph[asyncGet](...keys);
      if (value !== undefined) {
        // Save in cache before returning.
        await this.cache[asyncSet](...keys, value);
        return value;
      }
    }
    return undefined;
  }

  async *[asyncKeys]() {
    // Use a Set to de-duplicate the keys from the graphs.
    const set = new Set();
    // We also check the cache in case the set of keys provided by the other
    // graphs have changed since the cache was updated.
    for (const graph of [this.cache, ...this.graphs]) {
      for await (const key of graph) {
        set.add(key);
      }
    }
    yield* set;
  }
}
