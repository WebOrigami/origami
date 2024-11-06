import { isPlainObject } from "@weborigami/async-tree";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";
import mapFn from "./mapFn.js";

/**
 * Shorthand for calling `@mapFn` with `deep: true` option.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {import("./map.d.ts").TreeMapOptions} TreeMapOptions
 *
 * @this {AsyncTree|null}
 * @param {ValueKeyFn|TreeMapOptions} operation
 */
export default function deepMapFn(operation) {
  assertTreeIsDefined(this, "deepMap");
  /** @type {TreeMapOptions} */
  const options = isPlainObject(operation)
    ? // Dictionary
      { ...operation, deep: true }
    : // Function
      { deep: true, value: operation };
  return mapFn.call(this, options);
}
