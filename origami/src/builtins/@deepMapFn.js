import { isPlainObject } from "@weborigami/async-tree";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import mapFn from "./@mapFn.js";

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
  assertScopeIsDefined(this, "deepMap");
  /** @type {TreeMapOptions} */
  const options = isPlainObject(operation)
    ? // Dictionary
      { ...operation, deep: true }
    : // Function
      { deep: true, value: operation };
  return mapFn.call(this, options);
}
