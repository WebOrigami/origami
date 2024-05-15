import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import mapFn from "./@mapFn.js";

/**
 * Map a hierarchical tree of keys and values to a new tree of keys and values.
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
export default function map(source, operation) {
  assertScopeIsDefined(this, "map");
  return mapFn.call(this, operation)(source);
}
