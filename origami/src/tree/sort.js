import { sort as sortTransform } from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";
import { toFunction } from "../common/utilities.js";

/**
 * Return a new tree with the original's keys sorted.
 *
 * If the `options` include a `sortKey` function, that will be invoked for each
 * key in the tree to produce a sort key. If no `sortKey` function is provided,
 * the original keys will be used as sort keys.
 *
 * If the `options` include a `compare` function, that will be used to compare
 * sort keys.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {{ compare?: (a: any, b: any) => number, sortKey?: ValueKeyFn }}
 * SortOptions
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 * @param {SortOptions|ValueKeyFn} [options]
 */
export default async function sortBuiltin(treelike, options) {
  const tree = await getTreeArgument(this, arguments, treelike, "tree:sort");

  if (typeof options === "function") {
    // Take the function as the `sortKey` option
    options = { sortKey: options };
  }

  const compare = options?.compare;
  let extendedSortKeyFn;
  if (options?.sortKey) {
    const originalSortKey = toFunction(options?.sortKey);
    extendedSortKeyFn = async (key, tree) => {
      const value = await tree.get(key);
      const sortKey = await originalSortKey.call(parent, value, key);
      return sortKey;
    };
  }

  const sorted = await sortTransform(tree, {
    compare,
    sortKey: extendedSortKeyFn,
  });

  sorted.parent = this;
  return sorted;
}
