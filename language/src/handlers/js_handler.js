import { Tree } from "@weborigami/async-tree";
import { SystemCacheMap } from "../../main.js";
import enableValueCaching from "../cache/enableValueCaching.js";
import { cachePathSymbol } from "../runtime/symbols.js";

/**
 * A JavaScript file
 *
 * Unpacking a JavaScript file returns its default export, or its set of exports
 * if there is more than one.
 */
export default {
  mediaType: "application/javascript",

  /** @type {import("@weborigami/async-tree").UnpackFunction} */
  async unpack(packed, options = {}) {
    const { key, parent } = options;
    let importTarget = parent;
    while (importTarget.source && !importTarget.import) {
      importTarget = importTarget.source;
    }

    if (!parent?.import) {
      throw new TypeError(
        "A parent that supports importing modules is required to unpack JavaScript files.",
      );
    }

    const exports = await importTarget.import?.(key);

    let processed;
    const cachePath = parent[cachePathSymbol]
      ? SystemCacheMap.joinPath(parent[cachePathSymbol], key)
      : null;
    if ("default" in exports) {
      // Module with a default export; return that.
      const exportCachePath = cachePath
        ? SystemCacheMap.joinPath(cachePath, "")
        : null;
      processed = processExport(exports.default, parent, exportCachePath);
    } else {
      // Module with multiple named exports.
      processed = {};
      for (const [name, value] of Object.entries(exports)) {
        const exportCachePath = cachePath
          ? SystemCacheMap.joinPath(cachePath, name)
          : null;
        processed[name] = processExport(value, parent, exportCachePath);
      }
    }

    return processed;
  },
};

// Process an individual JavaScript export.
//
// - Bind functions to the parent tree so that they can find local files
// - Enable caching for functions and maps
//
function processExport(value, parent, cachePath) {
  let result;

  if (typeof value === "function") {
    result = value.bind(parent);
    // Copy over any properties that were attached to the function
    Object.assign(result, value);
  } else {
    result = value;
  }

  // Enable caching on the result if it is a function or a map. This is a
  // stricter condition that enableValueCaching enforces. The idea is that
  // object/array exports are most likely to have static properties that are
  // already immediately returned, so caching them would just slow things down.
  const cacheable =
    cachePath && (typeof result === "function" || Tree.isMap(result));
  if (cacheable) {
    // Enable caching
    result = enableValueCaching(result, cachePath);
  }

  return result;
}
