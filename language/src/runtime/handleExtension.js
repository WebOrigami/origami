import { isUnpackable, scope, symbols } from "@weborigami/async-tree";
import extname from "./extname.js";

/**
 * Given a value that was retrieved using the given key, search in scope for a
 * handler for the file extension on the key (if present). If a handler is
 * found, attach information from it to the value and return the modified value.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {AsyncTree} parent
 * @param {any} key
 * @param {any} value
 */
export default async function handleExtension(parent, key, value) {
  const extension = extname(key);
  let result = value;
  if (extension) {
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
    if (extensionHandler) {
      const input = value;

      // If the result is a plain string, box it as a String so we can attach
      // data to it.
      if (typeof result === "string") {
        result = new String(result);
      }

      if (extensionHandler.mediaType) {
        result.mediaType = extensionHandler.mediaType;
      }
      result[symbols.parent] = parent;

      const unpack = extensionHandler.unpack;
      if (unpack) {
        // Wrap the unpack function so its only called once per value.
        let loaded;
        result.unpack = async () => {
          loaded ??= await unpack(input, { key, parent });
          return loaded;
        };
      }
    }
  }
  return result;
}
