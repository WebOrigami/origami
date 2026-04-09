import { symbols, Tree } from "@weborigami/async-tree";
import path from "node:path";
import systemCache from "./systemCache.js";

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

      // Expose cache for debugging
      this.cache = systemCache;
    }

    // Default cache path for a map without a `cachePath` property
    get cachePath() {
      let result;
      if (this.path) {
        // Use file path as cache path
        let root = this;
        while (root.parent || root[symbols.parent]) {
          root = root.parent || root[symbols.parent];
        }
        const projectRootPath = root.path;
        const relativePath = path.relative(projectRootPath, this.path);
        let isPathWithinProjectRoot = !relativePath.startsWith("..");
        result = isPathWithinProjectRoot
          ? `_project/${relativePath}`
          : this.path;
      } else {
        result = `_map${nextPathId}`;
        nextPathId++;
      }
      this.cachePath = result; // memoize
      return result;
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

    async get(key) {
      const path = this.cachePathForKey(key);
      const value = await systemCache.getOrInsertComputedAsync(path, () =>
        super.get(key),
      );
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
      if (systemCache.has(keysPath)) {
        yield* systemCache.get(keysPath);
        return;
      }
      // const keys = await systemCache.getAndTrackDependencies(keysPath, () =>
      //   super.keys(),
      // );
      // yield* keys;
      const keys = Array.from(super.keys());
      systemCache.set(keysPath, keys);
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
