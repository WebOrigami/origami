import { Tree } from "@weborigami/async-tree";
import path from "node:path";
import systemCache from "./systemCache.js";

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
      if (!this._cachePath) {
        if (this.path) {
          // Use file path as cache path
          const root = Tree.root(this);
          const projectRootPath = root.path;
          const relativePath = path.relative(projectRootPath, this.path);
          let isPathWithinProjectRoot = !relativePath.startsWith("..");
          this._cachePath = isPathWithinProjectRoot
            ? `_project/${relativePath}`
            : this.path;
        } else {
          // Pick a default `cachePath` property
          this._cachePath = systemCache.nextDefaultCachePath();
        }
      }
      return this._cachePath;
    }

    cachePathForKey(key) {
      let cachePath = this.cachePath;
      if (!cachePath.endsWith("/")) {
        cachePath += "/";
      }
      if (key !== ".") {
        cachePath += key;
      }
      return cachePath;
    }

    delete(key) {
      const deleted = super.delete(key);
      systemCache.delete(this.cachePathForKey(key));
      if (deleted) {
        // Deleted an existing key, need to invalidate cached keys
        this.invalidateKeys();
      }
      return deleted;
    }

    get(key) {
      const cachePath = this.cachePathForKey(key);
      const value = systemCache.getOrInsertComputed(cachePath, () =>
        super.get(key),
      );
      if (Tree.isMap(value)) {
        Object.defineProperty(value, "cachePath", {
          value: cachePath,
          writable: false,
          enumerable: true,
          configurable: true,
        });
      }
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
      systemCache.delete(this.cachePathForKey(key));
      if (!this.has(key)) {
        // Adding a new key, need to invalidate cached keys
        this.invalidateKeys();
      }
      super.set(key, value);
    }
  };
}
