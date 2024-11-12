import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";
import deepMapFn from "./deepMapFn.js";

/**
 * Shorthand for calling `@map` with `deep: true` option.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {import("./map.d.ts").TreeMapOptions} TreeMapOptions
 *
 * @this {AsyncTree|null}
 * @param {Treelike} source
 * @param {ValueKeyFn|TreeMapOptions} operation
 */
export default function deepMap(source, operation) {
  assertTreeIsDefined(this, "tree:deepMap");
  return deepMapFn.call(this, operation)(source);
}
