import helpRegistry from "../common/helpRegistry.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";
import mapFn from "./mapFn.js";

/**
 * Map a hierarchical tree of keys and values to a new tree of keys and values.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {import("./map.js").TreeMapOptions} TreeMapOptions
 *
 * @this {AsyncTree|null}
 * @param {Treelike} source
 * @param {ValueKeyFn|TreeMapOptions} operation
 */
export default function map(source, operation) {
  assertTreeIsDefined(this, "tree:map");
  return mapFn.call(this, operation)(source);
}

helpRegistry.set(
  "tree:map",
  "(tree, options) - Create a new tree by mapping keys and/or values"
);
