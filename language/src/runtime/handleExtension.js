import {
  box,
  extension,
  isPacked,
  isStringlike,
  isUnpackable,
  setParent,
  trailingSlash,
} from "@weborigami/async-tree";
import projectGlobals from "../project/projectGlobals.js";

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

        const unpack = handler.unpack;
        if (unpack) {
          // Wrap the unpack function so its only called once per value.
          let loadPromise;
          value.unpack = async () => {
            loadPromise ??= unpack(value, { key, parent });
            return loadPromise;
          };
        }
      }
    }

    // If no handler was found, attach a handler that throws an error. Otherwise
    // an expression like `file/key` ends up casting `file` to a map. Since the
    // file is a Uint8Array, the map ends up backed by the array; getting `key`
    // from the map then quietly returns undefined. This masks the fact that the
    // reference is an error.
    if (!value.unpack) {
      const message = extname
        ? `No handler is registered for the ${extname} extension.`
        : `A file without an extension cannot be unpacked: ${key}`;
      value.unpack = async () => {
        throw new Error(message);
      };
    }
  }
  return value;
}
