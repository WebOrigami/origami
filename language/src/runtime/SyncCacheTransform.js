import enableValueCaching from "./enableValueCaching.js";
import { cachePathSymbol } from "./symbols.js";
import systemCache from "./systemCache.js";
import SystemCacheMap from "./SystemCacheMap.js";

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
export default function SyncCacheTransform(Base) {
  return class SyncCache extends Base {
    constructor(...args) {
      super(...args);

      // Expose cache for debugging
      this.cache = systemCache;
    }

    get cachePath() {
      // @ts-ignore
      return this[cachePathSymbol];
    }

    cachePathForKey(key) {
      return key === "."
        ? this.cachePath
        : SystemCacheMap.joinPath(this.cachePath, key);
    }

    delete(key) {
      const deleted = super.delete(key);
      if (typeof key === "string") {
        systemCache.delete(this.cachePathForKey(key));
        if (deleted) {
          // Deleted an existing key, need to invalidate cached keys
          this.invalidateKeys();
        }
      }
      return deleted;
    }

    get(key) {
      if (typeof key !== "string" || key.length === 0) {
        // Non-string keys and non-empty strings can't be cached
        return super.get(key);
      }
      const cachePath = this.cachePathForKey(key);
      const value = systemCache.getOrInsertComputed(cachePath, () => {
        let result = super.get(key);
        result = enableValueCaching(result, cachePath);
        return result;
      });
      return value;
    }

    invalidateKeys() {
      const keysPath = this.cachePathForKey("_keys");
      systemCache.delete(keysPath);
    }

    *keys() {
      const keysPath = this.cachePathForKey("_keys");
      const keys = systemCache.getOrInsertComputed(keysPath, () =>
        // We can't cache an iterator; convert to array
        Array.from(super.keys()),
      );
      yield* keys;
    }

    onKeysChange(key) {
      super.onKeysChange?.(key);
      this.invalidateKeys();
    }

    onValueChange(key) {
      super.onValueChange?.(key);
      systemCache.delete(this.cachePathForKey(key));
    }

    set(key, value) {
      if (!this._self) {
        // Initializing in constructor
        super.set(key, value);
        return;
      }
      if (typeof key !== "string") {
        return super.set(key, value);
      }
      systemCache.delete(this.cachePathForKey(key));
      if (!this.has(key)) {
        // Adding a new key, need to invalidate cached keys
        this.invalidateKeys();
      }
      super.set(key, value);
    }
  };
}
