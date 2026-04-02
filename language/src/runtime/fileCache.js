import {
  AsyncMap,
  isUnpackable,
  keysFromPath,
  SyncMap,
  trailingSlash,
  Tree,
} from "@weborigami/async-tree";
import path from "path";

/**
 * Cache values in memory from a map that's backed by an OrigamiFileMap. When a
 * value is returned, track which files are referenced. If any of those files
 * change, invalidate the cached value so that the next get() reloads it.
 *
 * @typedef {import("@weborigami/async-tree").Maplike} Maplike
 * @typedef {import("./OrigamiFileMap.d.ts").default} OrigamiFileMap
 *
 * @param {Maplike} sourceMaplike
 * @param {OrigamiFileMap} fileRoot
 * @param {string} [basePath]
 * @returns {AsyncMap}
 */
export default function fileCache(sourceMaplike, fileRoot, basePath) {
  const source = Tree.from(sourceMaplike, { deep: true });

  const cache = new SyncMap();

  if (basePath === undefined) {
    // Top of cache
    basePath = "";

    // Initialize watching for changes
    fileRoot.watch();
    fileRoot.addEventListener("change", async (event) => {
      const { filePath } = event.options;
      const relativePath = path.relative(fileRoot.path, filePath);
      const dependencies = fileRoot.dependencies;
      await invalidateDependentResources(cache, relativePath, dependencies);
    });
  }

  return Object.assign(new AsyncMap(), {
    cache,

    description: "fileCache",

    async get(key) {
      // Check cache tree first
      let cacheValue = cache.get(key);
      if (cacheValue !== undefined) {
        // Cache hit
        return cacheValue;
      }

      // Cache miss, get the value from the source map while having
      // TrackDependencyMixin record which files this value depends on.
      const resourcePath = path.join(basePath, key);
      const context = { resourcePath };
      let value = await fileRoot.asyncStorage.run(context, async () => {
        let value = await source.get(key);
        if (isUnpackable(value)) {
          value = await value.unpack();
        }
        return value;
      });

      let cacheKey;
      if (Tree.isMaplike(value)) {
        // Apply caching to subtree
        cacheKey = trailingSlash.add(key);
        const subtreePath = trailingSlash.add(resourcePath);
        value = fileCache(value, fileRoot, subtreePath);
      } else {
        cacheKey = trailingSlash.remove(key);
      }

      // Save in cache
      cache.set(cacheKey, value);

      return value;
    },

    // REVIEW: Cache keys too?
    async *keys() {
      return source.keys();
    },

    trailingSlashKeys: /** @type {any} */ (source).trailingSlashKeys,
  });
}

async function invalidateDependentResource(cache, resourcePath) {
  const keys = keysFromPath(resourcePath);
  const lastKey = keys.pop();
  let node = cache;
  for (const key of keys) {
    node = await node.get(key);
    if (node === undefined) {
      return;
    }
  }
  if (node !== undefined) {
    node.cache?.delete(lastKey);
  }
}

async function invalidateDependentResources(cache, relativePath, dependencies) {
  const dependentResources = dependencies.get(relativePath);
  if (dependentResources) {
    for (const resourcePath of dependentResources) {
      await invalidateDependentResource(cache, resourcePath);
    }
  }
}
