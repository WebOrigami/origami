import {
  box,
  extension,
  isPacked,
  isStringlike,
  isUnpackable,
  setParent,
  trailingSlash,
} from "@weborigami/async-tree";
import globals from "../project/projectGlobals.js";

let projectGlobals;

/**
 * If the given value is packed (e.g., buffer) and the key is a string-like path
 * that ends in an extension, search for a handler for that extension and, if
 * found, attach it to the value.
 *
 * @param {import("@weborigami/types").AsyncTree|null} parent
 * @param {any} value
 * @param {any} key
 */
export default async function handleExtension(parent, value, key) {
  projectGlobals ??= await globals();
  if (isPacked(value) && isStringlike(key) && value.unpack === undefined) {
    const hasSlash = trailingSlash.has(key);
    if (hasSlash) {
      key = trailingSlash.remove(key);
    }

    // Special cases: `.ori.<ext>` extensions are Origami documents,
    // `.jse.<ext>` are JSE documents.
    // TODO: Remove .jse.<ext>
    const extname = key.match(/\.ori\.\S+$/)
      ? ".oridocument"
      : key.match(/\.jse\.\S+$/)
      ? ".jsedocument"
      : extension.extname(key);
    if (extname) {
      const handlerName = `${extname.slice(1)}.handler`;
      let handler = await projectGlobals[handlerName];
      if (handler) {
        if (isUnpackable(handler)) {
          // The extension handler itself needs to be unpacked
          handler = await handler.unpack();
        }

        if (hasSlash && handler.unpack) {
          // Key like `data.json/` ends in slash -- unpack immediately
          return handler.unpack(value, { key, parent });
        }

        // If the value is a primitive, box it so we can attach data to it.
        value = box(value);

        if (handler.mediaType) {
          value.mediaType = handler.mediaType;
        }
        setParent(value, parent);

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
