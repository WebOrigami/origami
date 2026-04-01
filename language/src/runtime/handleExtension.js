import {
  box,
  extension,
  isPacked,
  isStringlike,
  isUnpackable,
  setParent,
  trailingSlash,
} from "@weborigami/async-tree";
import getPackedPath from "../handlers/getPackedPath.js";
import projectGlobals from "../project/projectGlobals.js";

const unpackCache = new Map();

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
          value.unpack = wrapUnpack(handler.unpack, value, key, parent);
        }
      }
    }
  }

  return value;
}

// Wrap the unpack function so it's only called once per value, and so we can
// add the file path to any errors the unpack function throws.
function wrapUnpack(unpack, value, key, parent) {
  const filePath = getPackedPath(value, { key, parent });
  return async () => {
    if (unpackCache.has(filePath)) {
      // Cache hit
      return unpackCache.get(filePath);
    }

    let result;
    try {
      // Save promise in cache so concurrent requests get the same promise
      const promise = unpack(value, { key, parent });
      unpackCache.set(filePath, promise);
      result = await promise;
    } catch (/** @type {any} */ error) {
      const message = `Can't unpack ${filePath}\n${error.message}`;
      throw new error.constructor(message, { cause: error });
    }

    unpackCache.set(filePath, result);
    return result;
  };
}
