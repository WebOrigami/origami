import {
  box,
  extension,
  isPacked,
  isStringlike,
  isUnpackable,
  setParent,
  trailingSlash,
  Tree,
} from "@weborigami/async-tree";
import path from "node:path";
import getPackedPath from "../handlers/getPackedPath.js";
import { cachePathSymbol } from "./symbols.js";
import systemCache from "./systemCache.js";
import SystemCacheMap from "./SystemCacheMap.js";

/**
 * If the given value is packed (e.g., buffer) and the key is a string-like path
 * that ends in an extension, search for a handler for that extension and, if
 * found, attach it to the value.
 *
 * @param {any} value
 * @param {any} key
 * @param {any} handlers
 * @param {import("@weborigami/async-tree").SyncOrAsyncMap|null} [parent]
 */
export default function handleExtension(value, key, handlers, parent = null) {
  if (
    isPacked(value) &&
    isStringlike(key) &&
    value.unpack === undefined &&
    handlers
  ) {
    const normalized = trailingSlash.remove(key);

    // Special cases: `.ori.<ext>` extensions are Origami documents
    const extname = normalized.match(/\.ori\.\S+$/)
      ? ".oridocument"
      : extension.extname(normalized);
    if (extname) {
      const handlerName = `${extname.slice(1)}_handler`;
      // Use `in` to look for handle so that, if the handler is a promise, we
      // can still find it without awaiting it here.
      if (handlerName in handlers) {
        let handler = handlers[handlerName];

        // If the value is a primitive, box it so we can attach data to it.
        value = box(value);

        if (handler.mediaType) {
          value.mediaType = handler.mediaType;
        }

        if (parent) {
          setParent(value, parent);
        }

        // Wrap the unpack function so it caches the unpacked value, and so we
        // can add the file path to any errors the unpack function throws.
        const filePath = getPackedPath(value, { key: normalized, parent });
        let fileCachePath;
        if (parent?.[cachePathSymbol]) {
          fileCachePath = path.join(parent[cachePathSymbol], normalized);
        } else {
          const projectRoot = parent ? Tree.root(parent) : null;
          if (projectRoot) {
            const projectRootPath = projectRoot?.path;
            const relativePath = projectRootPath
              ? path.relative(projectRootPath, filePath)
              : null;
            let isPathWithinProjectRoot = relativePath
              ? !relativePath.startsWith("..")
              : false;
            fileCachePath = isPathWithinProjectRoot ? relativePath : filePath;
          } else {
            fileCachePath = SystemCacheMap.nextDefaultCachePath();
          }
        }
        const unpackCachePath = trailingSlash.add(fileCachePath);
        value.unpack = async () =>
          systemCache.getOrInsertComputedAsync(unpackCachePath, async () => {
            if (handler instanceof Promise) {
              handler = await handler;
            }
            if (isUnpackable(handler)) {
              // The extension handler itself needs to be unpacked
              handler = await handler.unpack();
            }

            const unpacked = await handler.unpack(value, {
              key: normalized,
              parent,
            });

            return unpacked;
          });
      }
    }
  }

  return value;
}
