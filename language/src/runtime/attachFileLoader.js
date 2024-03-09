import { Tree } from "@weborigami/async-tree";
import extname from "./extname.js";
import * as symbols from "./symbols.js";

export default async function attachFileLoader(scope, key, value, parent) {
  const extension = extname(key);
  let result = value;
  if (extension) {
    const loaderName = extension.slice(1);
    const loader = await Tree.traverse(scope, "@loaders", loaderName);
    if (loader) {
      const input = value;

      // If the result is a plain string, box it as a String so we can attach
      // data to it.
      if (typeof result === "string") {
        result = new String(result);
      }
      result[symbols.parent] = parent;

      // Wrap the loader with a function that will only be called once per
      // value.
      let loaded;
      result.unpack = async () => {
        loaded ??= await loader(input, { key, parent });
        return loaded;
      };
    }
  }
  return result;
}
