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

      // Pick a default `cachePath` property
      if (this.path) {
        // Use file path as cache path
        const root = Tree.root(this);
        const projectRootPath = root.path;
        const relativePath = path.relative(projectRootPath, this.path);
        let isPathWithinProjectRoot = !relativePath.startsWith("..");
        this.cachePath = isPathWithinProjectRoot
          ? `_project/${relativePath}`
          : this.path;
      } else {
        this.cachePath = systemCache.nextDefaultCachePath();
      }
    }

    cachePathForKey(key) {
      let path = this.cachePath;
      if (!path.endsWith("/")) {
        path += "/";
      }
      path += key;
      return path;
    }

    delete(key) {
      super.delete(key);
      systemCache.delete(this.cachePathForKey(key));
    }

    get(key) {
      const path = this.cachePathForKey(key);
      const value = systemCache.getOrInsertComputed(path, () => super.get(key));
      if (Tree.isMap(value)) {
        Object.defineProperty(value, "cachePath", {
          value: path,
          writable: false,
          enumerable: true,
          configurable: true,
        });
      }
      return value;
    }

    *keys() {
      const keysPath = this.cachePathForKey("_keys");
      const keys = systemCache.getOrInsertComputed(keysPath, () =>
        // We can't cache an iterator; convert to array
        Array.from(super.keys()),
      );
      yield* keys;
    }

    onKeysChange(path) {
      systemCache.delete(this.cachePathForKey("_keys"));
    }

    onValueChange(path) {
      systemCache.delete(this.cachePathForKey(path));
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
