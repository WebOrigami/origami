import { SyncMap } from "@weborigami/async-tree";
import { AsyncLocalStorage } from "node:async_hooks";

// Async storage for tracking dependencies encountered during function evaluation
const storage = new AsyncLocalStorage();

/**
 * General-purpose mixin for Origami maps with dependency tracking, used for:
 * files, site resources, and scope references in Origami files
 *
 * This wraps a map's get() and keys() methods to add caching and dependency tracking.
 * It tracks which cached values are downstream of other cached values so that if
 * an upstream value changes, all dependent downstream cached values can be
 * invalidated efficiently.
 *
 * Cache entries look like:
 *
 *      key -> {
 *        downstreams: Set({ map, key }),
 *        upstreams: Set({ map, key }),
 *        value
 *      }
 *
 * This allows for efficiently evicting all a value and all its downstream
 * dependent cached values.
 *
 * Example project:
 *
 *     site.ori loads a.ori and b.ori
 *     a.ori loads c.ori
 *     b.ori loads c.ori
 *     c.ori doesn't load anything
 *
 * Resulting cache:
 *
 *      site.ori -> { value: ... }
 *      a.ori -> { downstreams: Set(site.ori), value: ... }
 *      b.ori -> { downstreams: Set(site.ori), value: ... }
 *      c.ori -> { downstreams: Set(a.ori, b.ori), value: ... }
 */
export default function CacheMixin(Base) {
  return class extends Base {
    constructor(...args) {
      super(...args);
      this.cache = new CacheMap();
      /** @type {any}>} */ (this.cache).source = this; // For debugging
    }

    delete(key) {
      super.delete(key);
      this.cache.delete(key);
    }

    get(key) {
      let entry = this.cache.get(key);
      if (!entry) {
        // Cache miss

        // Create new async context to track entries downstream of this value
        const context = { map: this, key };

        // Get value in async context, don't await the result yet
        const value = storage.run(context, async () => {
          const value = await super.get(key);
          // Add resolved value to cache
          entry.value = value;
          return value;
        });

        // Add promise to cache so concurrent requests get the same promise
        entry = { value };
        this.cache.set(key, entry);
      }

      // Is this call happening downstream of another cached value?
      const downstream = storage.getStore();
      if (downstream) {
        // Record that the downstream value depends on this cached value
        entry.downstreams ??= new Map();
        const downstreamsForMap =
          entry.downstreams.get(downstream.map) ?? new Set();
        downstreamsForMap.add(downstream.key);
        entry.downstreams.set(downstream.map, downstreamsForMap);
      }

      return entry.value;
    }

    keys() {
      return super.keys();
    }

    set(key, value) {
      if (!this._self) {
        // Initializing in constructor
        super.set(key, value);
        return;
      }
      this.delete(key);
      super.set(key, value);
    }
  };
}

class CacheMap extends SyncMap {
  delete(key) {
    const entry = this.get(key);
    if (entry) {
      // Invalidate downstream cached values
      if (entry.downstreams) {
        for (const [downstreamMap, keySet] of entry.downstreams.entries()) {
          for (const downstreamKey of keySet) {
            downstreamMap.cache.delete(downstreamKey);
          }
        }
      }
    }
    return super.delete(key);
  }
}
