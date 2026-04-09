import { AsyncMap, setParent, symbols, Tree } from "@weborigami/async-tree";
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
export default function cacheWithTracking(maplike) {
  const source = Tree.from(maplike, { deep: true });
  let cachePath;

  const result = Object.assign(new AsyncMap(), {
    cache: systemCache,

    // Default cache path for a map without a `cachePath` property
    get cachePath() {
      if (cachePath) {
        return cachePath;
      }

      if (source.path) {
        // Use file path as cache path
        let root = source;
        while (root.parent || root[symbols.parent]) {
          root = root.parent || root[symbols.parent];
        }
        const projectRootPath = root.path;
        const relativePath = path.relative(projectRootPath, source.path);
        let isPathWithinProjectRoot = !relativePath.startsWith("..");
        cachePath = isPathWithinProjectRoot
          ? `_project/${relativePath}`
          : source.path;
      } else {
        cachePath = `_map${nextPathId}`;
        nextPathId++;
      }

      return cachePath;
    },

    cachePathForKey(key) {
      let path = this.cachePath;
      if (!path.endsWith("/")) {
        path += "/";
      }
      path += key;
      return path;
    },

    delete(key) {
      source.delete(key);
      systemCache.delete(this.cachePathForKey(key));
    },

    async get(key) {
      const path = this.cachePathForKey(key);
      let value = await systemCache.getAndTrackDependencies(path, () =>
        source.get(key),
      );
      if (Tree.isMap(value)) {
        const cached = await cacheWithTracking(value);
        Object.defineProperty(cached, "cachePath", {
          value: path,
          writable: false,
          enumerable: true,
          configurable: true,
        });
        setParent(cached, this);
        Object.defineProperty(value, "result", {
          value: cached,
          writable: false,
          enumerable: true,
          configurable: true,
        });
        value = cached;
      }
      return value;
    },

    async *keys() {
      const keysPath = this.cachePathForKey("_keys");
      const keys = await systemCache.getAndTrackDependencies(
        keysPath,
        async () => {
          return Tree.keys(source);
        },
      );
      yield* keys;
    },

    set(key, value) {
      this.delete(key);
      source.set(key, value);
    },

    source,

    watch() {
      /** @type {any} */
      let watchTarget = source;
      while (watchTarget.source && !watchTarget.watch) {
        watchTarget = watchTarget.source;
      }

      watchTarget.watch();
      watchTarget.addEventListener("keyschange", () =>
        systemCache.delete(this.cachePathForKey("_keys")),
      );
      watchTarget.addEventListener("valuechange", (event) =>
        systemCache.delete(this.cachePathForKey(event.options.relativePath)),
      );
      watchTarget.addEventListener("valuedelete", (event) =>
        systemCache.delete(this.cachePathForKey(event.options.relativePath)),
      );
    },
  });

  Object.defineProperty(source, "result", {
    value: result,
    writable: false,
    enumerable: true,
    configurable: true,
  });

  return result;
}
