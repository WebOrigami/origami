import { setParent } from "@weborigami/async-tree";
import { cachePathSymbol, cachingSymbol } from "../runtime/symbols.js";

/**
 * Given an object that's the top-level result of an Origami file, perform any
 * necessary processing.
 */
export default function processOriExport(object, parent) {
  setParent(object, parent);

  if (object[cachePathSymbol]) {
    Object.defineProperty(object, cachingSymbol, {
      value: true,
      enumerable: false,
      configurable: true,
    });
  }
}
