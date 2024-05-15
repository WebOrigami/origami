import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import deepMapFn from "./@deepMapFn.js";

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
  assertScopeIsDefined(this, "deepMap");
  return deepMapFn.call(this, operation)(source);
}
