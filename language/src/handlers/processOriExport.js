import { setParent } from "@weborigami/async-tree";

/**
 * Given an object that's the top-level result of an Origami file, perform any
 * necessary processing.
 */
export default function processOriExport(value, source, parent) {
  setParent(value, parent);

  // if (source.cachePath) {
  //   const cachePath = trailingSlash.add(source.cachePath);
  //   value = enableValueCaching(value, cachePath);
  // }

  return value;
}
