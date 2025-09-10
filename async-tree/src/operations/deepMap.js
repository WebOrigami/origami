import { assertIsTreelike, isPlainObject } from "../utilities.js";
import map from "./map.js";

/**
 * Shorthand for calling `map` with the `deep: true` option.
 *
 * @typedef {import("../../index.ts").TreeMapOptions} TreeMapOptions
 * @typedef {import("../../index.ts").Treelike} Treelike
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {Treelike} treelike
 * @param {ValueKeyFn|TreeMapOptions} operation
 * @returns {Promise<AsyncTree>}
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
