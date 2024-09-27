import {
  box,
  isPacked,
  isStringLike,
  isUnpackable,
  scope,
  symbols,
  trailingSlash,
} from "@weborigami/async-tree";

/**
 * If the given path ends in an extension, return it. Otherwise, return the
 * empty string.
 *
 * This is meant as a basic replacement for the standard Node `path.extname`.
 * That standard function inaccurately returns an extension for a path that
 * includes a near-final extension but ends in a final slash, like `foo.txt/`.
 * Node thinks that path has a ".txt" extension, but for our purposes it
 * doesn't.
 *
 * @param {string} path
 */
export function extname(path) {
  // We want at least one character before the dot, then a dot, then a non-empty
  // sequence of characters after the dot that aren't slahes or dots.
  const extnameRegex = /[^/](?<ext>\.[^/\.]+)$/;
  const match = String(path).match(extnameRegex);
  const extension = match?.groups?.ext.toLowerCase() ?? "";
  return extension;
}

/**
 * Find an extension handler for a file in the given container.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {AsyncTree} parent
 * @param {string} extension
 */
export async function getExtensionHandler(parent, extension) {
  const handlerName = `${extension.slice(1)}_handler`;
  const parentScope = scope(parent);
  /** @type {import("../../index.ts").ExtensionHandler} */
  let extensionHandler = await parentScope?.get(handlerName);
  if (isUnpackable(extensionHandler)) {
    // The extension handler itself needs to be unpacked. E.g., if it's a
    // buffer containing JavaScript file, we need to unpack it to get its
    // default export.
    // @ts-ignore
    extensionHandler = await extensionHandler.unpack();
  }
  return extensionHandler;
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
  if (isPacked(value) && isStringLike(key)) {
    const hasSlash = trailingSlash.has(key);
    if (hasSlash) {
      key = trailingSlash.remove(key);
    }

    // Special case: `.ori.<ext>` extensions are Origami documents.
    const extension = key.match(/\.ori\.\S+$/) ? ".ori_document" : extname(key);
    if (extension) {
      const handler = await getExtensionHandler(parent, extension);
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
          let loaded;
          value.unpack = async () => {
            loaded ??= await unpack(value, { key, parent });
            return loaded;
          };
        }
      }
    }
  }
  return value;
}
