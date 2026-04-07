import { SyncMap } from "@weborigami/async-tree";
import { AsyncLocalStorage } from "node:async_hooks";

// Async storage for tracking dependencies encountered during function evaluation
const storage = new AsyncLocalStorage();

class CacheMap extends SyncMap {
  delete(key) {
    const entry = this.get(key);
    if (entry) {
      // Invalidate downstream cached values
      if (entry.downstreams) {
        for (const downstreamPath of entry.downstreams) {
          cache.delete(downstreamPath);
        }
      }
    }
    return super.delete(key);
  }
}

// System-wide cache
export const cache = new CacheMap(); // Export for debugging

// For choosing a quasi-unique path for maps without a `path` property
let nextPathId = 0;

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
 *        downstreams: Set(path),
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

      // Need to assign a unique path to any map without a `path` property
      if (!this.path) {
        this.path = `_map${nextPathId}`;
        nextPathId++;
      }

      // Expose cache for debugging
      this.cache = cache;
    }

    delete(key) {
      super.delete(key);
      cache.delete(this.pathForKey(key));
    }

    get(key) {
      const path = this.pathForKey(key);
      let entry = cache.get(path);
      if (!entry) {
        // Cache miss

        // Create new async context to track entries downstream of this value
        const context = { downstream: path };

        // Get value in async context, don't await the result yet
        const value = storage.run(context, async () => {
          const value = await super.get(key);
          // Add resolved value to cache
          entry.value = value;
          return value;
        });

        // Add promise to cache so concurrent requests get the same promise
        entry = { value };
        cache.set(path, entry);
      }

      // Is this call happening downstream of another cached value?
      const { downstream } = storage.getStore() ?? {};
      if (downstream) {
        // Record that the downstream value depends on this cached value
        entry.downstreams ??= new Set();
        entry.downstreams.add(downstream);
      }

      return entry.value;
    }

    keys() {
      return super.keys();
    }

    pathForKey(key) {
      let path = this.path;
      if (!(path.endsWith("/") || path.endsWith(":"))) {
        path += "/";
      }
      path += key;
      return path;
    }

    onValueChange(key) {
      cache.delete(this.pathForKey(key));
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
