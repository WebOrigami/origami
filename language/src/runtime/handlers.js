import {
  box,
  extension,
  isPacked,
  isStringLike,
  isUnpackable,
  scope,
  symbols,
  trailingSlash,
} from "@weborigami/async-tree";

/** @typedef {import("../../index.ts").ExtensionHandler} ExtensionHandler */

// Track extensions handlers for a given containing tree.
const handlersForContainer = new Map();

/**
 * Find an extension handler for a file in the given container.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {AsyncTree} parent
 * @param {string} extension
 */
export async function getExtensionHandler(parent, extension) {
  let handlers = handlersForContainer.get(parent);
  if (handlers) {
    if (handlers[extension]) {
      return handlers[extension];
    }
  } else {
    handlers = {};
    handlersForContainer.set(parent, handlers);
  }

  const handlerName = `${extension.slice(1)}.handler`;
  const parentScope = scope(parent);

  /** @type {Promise<ExtensionHandler>} */
  let handlerPromise = parentScope
    ?.get(handlerName)
    .then(async (extensionHandler) => {
      if (isUnpackable(extensionHandler)) {
        // The extension handler itself needs to be unpacked. E.g., if it's a
        // buffer containing JavaScript file, we need to unpack it to get its
        // default export.
        // @ts-ignore
        extensionHandler = await extensionHandler.unpack();
      }
      // Update cache with actual handler
      handlers[extension] = extensionHandler;
      return extensionHandler;
    });

  // Cache handler even if it's undefined so we don't look it up again
  handlers[extension] = handlerPromise;

  return handlerPromise;
}

/**
 * If the given value is packed (e.g., buffer) and the key is a string-like path
 * that ends in an extension, search for a handler for that extension and, if
 * found, attach it to the value.
 *
 * @param {import("@weborigami/types").AsyncTree} parent
 * @param {any} value
 * @param {any} key
 */
export async function handleExtension(parent, value, key) {
  if (isPacked(value) && isStringLike(key) && value.unpack === undefined) {
    const hasSlash = trailingSlash.has(key);
    if (hasSlash) {
      key = trailingSlash.remove(key);
    }

    // Special case: `.ori.<ext>` extensions are Origami documents.
    const extname = key.match(/\.ori\.\S+$/)
      ? ".oridocument"
      : extension.extname(key);
    if (extname) {
      const handler = await getExtensionHandler(parent, extname);
      if (handler) {
        if (hasSlash && handler.unpack) {
          // Key like `data.json/` ends in slash -- unpack immediately
          return handler.unpack(value, { key, parent });
        }

        // If the value is a primitive, box it so we can attach data to it.
        value = box(value);

        if (handler.mediaType) {
          value.mediaType = handler.mediaType;
        }
        value[symbols.parent] = parent;

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
  }
  return value;
}
