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
export default function AsyncCacheTransform(Base) {
  return class AsyncCache extends Base {
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
      let cachePath = this.cachePath;
      if (!cachePath.endsWith("/")) {
        cachePath += "/";
      }
      if (key !== ".") {
        cachePath += key;
      }
      return cachePath;
    }

    async delete(key) {
      const deleted = await super.delete(key);
      systemCache.delete(this.cachePathForKey(key));
      return deleted;
    }

    async get(key) {
      const cachePath = this.cachePathForKey(key);
      const value = await systemCache.getOrInsertComputedAsync(cachePath, () =>
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

    async *keys() {
      const keysPath = this.cachePathForKey("_keys");
      const keys = await systemCache.getOrInsertComputedAsync(
        keysPath,
        async () => {
          // We can't cache an iterator; convert to array
          const result = [];
          for await (const key of super.keys()) {
            result.push(key);
          }
          return result;
        },
      );
      yield* keys;
    }

    onKeysChange(path) {
      systemCache.delete(this.cachePathForKey("_keys"));
    }

    onValueChange(path) {
      systemCache.delete(this.cachePathForKey(path));
    }

    async set(key, value) {
      systemCache.updateValue(this.cachePathForKey(key), value);
      await super.set(key, value);
    }
  };
}
