import { Tree } from "@weborigami/async-tree";
import extname from "./extname.js";
import * as symbols from "./symbols.js";

export default async function attachFileLoader(scope, key, value, parent) {
  const extension = extname(key);
  let result = value;
  if (extension) {
    const loaderName = extension.slice(1);
    const fileType =
      (await Tree.traverse(scope, "@loaders", loaderName)) ||
      (await scope.get(loaderName));
    if (fileType) {
      const input = value;

      // If the result is a plain string, box it as a String so we can attach
      // data to it.
      if (typeof result === "string") {
        result = new String(result);
      }

      if (fileType.mediaType) {
        result.mediaType = fileType.mediaType;
      }
      result[symbols.parent] = parent;

      // Wrap the unpack function so its only called once per value.
      let loaded;
      result.unpack = async () => {
        loaded ??= await fileType.unpack(input, { key, parent });
        return loaded;
      };
    }
  }
  return result;
}
