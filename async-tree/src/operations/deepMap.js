import { assertIsTreelike, isPlainObject } from "../utilities.js";
import map from "./map.js";

/**
 * Shorthand for calling `map` with the `deep: true` option.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {import("@weborigami/async-tree").TreeMapOptions} TreeMapOptions
 *
 * @param {Treelike} treelike
 * @param {ValueKeyFn|TreeMapOptions} operation
 */
export default async function deepMap(treelike, operation) {
  assertIsTreelike(treelike, "deepMap");
  const options = isPlainObject(operation)
    ? // Dictionary
      { ...operation, deep: true }
    : // Function
      { deep: true, value: operation };
  return map(treelike, options);
}
