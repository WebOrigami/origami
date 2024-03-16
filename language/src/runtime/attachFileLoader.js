import extname from "./extname.js";
import * as symbols from "./symbols.js";

const TypedArray = Object.getPrototypeOf(Uint8Array);

export default async function attachFileLoader(scope, key, value, parent) {
  const extension = extname(key);
  let result = value;
  if (extension) {
    const handlerName = `${extension.slice(1)}.handler`;
    let extensionHandler = await scope.get(handlerName);
    if (
      extensionHandler instanceof Buffer ||
      extensionHandler instanceof TypedArray
    ) {
      // The extension handler itself needs to be unpacked. E.g., if it's a
      // buffer containing JavaScript file, we need to unpack it to get its
      // default export.
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

      // Wrap the unpack function so its only called once per value.
      let loaded;
      result.unpack = async () => {
        loaded ??= await extensionHandler.unpack(input, { key, parent });
        return loaded;
      };
    }
  }
  return result;
}
