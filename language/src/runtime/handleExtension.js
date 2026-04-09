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
import projectGlobals from "../project/projectGlobals.js";
import systemCache from "./systemCache.js";

/**
 * If the given value is packed (e.g., buffer) and the key is a string-like path
 * that ends in an extension, search for a handler for that extension and, if
 * found, attach it to the value.
 *
 * @param {any} value
 * @param {any} key
 * @param {import("@weborigami/async-tree").SyncOrAsyncMap|null} [parent]
 */
export default async function handleExtension(value, key, parent = null) {
  if (isPacked(value) && isStringlike(key) && value.unpack === undefined) {
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
      const handlers = await projectGlobals(parent);
      let handler = await handlers[handlerName];
      if (handler) {
        if (isUnpackable(handler)) {
          // The extension handler itself needs to be unpacked
          handler = await handler.unpack();
        }

        // If the value is a primitive, box it so we can attach data to it.
        value = box(value);

        if (handler.mediaType) {
          value.mediaType = handler.mediaType;
        }

        if (parent) {
          setParent(value, parent);
        }

        if (handler.unpack) {
          // Wrap the unpack function so it caches the unpacked value, and so we
          // can add the file path to any errors the unpack function throws.
          const filePath = getPackedPath(value, { key, parent });
          const projectRoot = parent ? Tree.root(parent) : null;
          const projectRootPath = projectRoot?.path;
          const relativePath = path.relative(projectRootPath, filePath);
          let isPathWithinProjectRoot = !relativePath.startsWith("..");
          const cachePath = isPathWithinProjectRoot
            ? `_unpack/${relativePath}`
            : `_unpack${filePath}`;
          value.unpack = async () =>
            systemCache.getOrInsertComputedAsync(cachePath, async () => {
              // We get the data from the parent map again, which is inefficient
              // but: a) this reads the loaded data from the file cache so it's
              // not that slow and b) this ensures the file data is tracked as
              // an upstream dependency of the unpacked value.

              /** @type {any} */
              let getTarget = parent;
              while (getTarget.result) {
                getTarget = getTarget.result;
              }
              const data = await getTarget.get(key);
              const unpacked = await handler.unpack(data, {
                key,
                parent: getTarget,
              });
              return unpacked;
            });
        }
      }
    }
  }

  return value;
}
