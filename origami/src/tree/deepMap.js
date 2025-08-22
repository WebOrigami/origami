import { isPlainObject } from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";
import map from "./map.js";

/**
 * Shorthand for calling `map` with `deep: true` option.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {import("./map.d.ts").TreeMapOptions} TreeMapOptions
 *
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {ValueKeyFn|TreeMapOptions} operation
 */
export default async function deepMap(treelike, operation) {
  const tree = await getTreeArgument(
    this,
    arguments,
    treelike,
    "deepMap",
    true
  );
  /** @type {TreeMapOptions} */
  const options = isPlainObject(operation)
    ? // Dictionary
      { ...operation, deep: true }
    : // Function
      { deep: true, value: operation };
  return map.call(this, tree, options);
}
