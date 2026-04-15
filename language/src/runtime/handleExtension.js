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
import systemCache from "./systemCache.js";

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
    const hasSlash = trailingSlash.has(key);
    if (hasSlash) {
      key = trailingSlash.remove(key);
    }

    // Special cases: `.ori.<ext>` extensions are Origami documents
    const extname = key.match(/\.ori\.\S+$/)
      ? ".oridocument"
      : extension.extname(key);
    if (extname) {
      const handlerName = `${extname.slice(1)}_handler`;
      let handler = handlers[handlerName];
      if (handler) {
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
        const filePath = getPackedPath(value, { key, parent });
        const projectRoot = parent ? Tree.root(parent) : null;
        const projectRootPath = projectRoot?.path;
        const relativePath = projectRootPath
          ? path.relative(projectRootPath, filePath)
          : null;
        let isPathWithinProjectRoot = relativePath
          ? !relativePath.startsWith("..")
          : false;
        const cachePath = path.join(
          isPathWithinProjectRoot ? relativePath : filePath,
          "_unpack",
        );
        value.unpack = async () =>
          systemCache.getOrInsertComputedAsync(cachePath, async () => {
            handler = await handler;
            if (isUnpackable(handler)) {
              // The extension handler itself needs to be unpacked
              handler = await handler.unpack();
            }

            // If we have a parent, we get the data from the parent map again.
            // This is inefficient but: a) this reads the loaded data from the
            // file cache so it's not that slow and b) this ensures the file
            // data is tracked as an upstream dependency of the unpacked
            // value.
            const data = parent ? await parent.get(key) : value;
            const unpacked = await handler.unpack(data, {
              key,
              parent,
            });
            return unpacked;
          });
      }
    }
  }

  return value;
}
