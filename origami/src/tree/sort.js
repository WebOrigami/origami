import helpRegistry from "../common/helpRegistry.js";
import getTreeArgument from "../misc/getTreeArgument.js";
import sortFn from "./sortFn.js";

/**
 * Return a new tree with the original's keys sorted.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {{ compare?: (a: any, b: any) => number, sortKey?: ValueKeyFn }}
 * SortOptions
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 * @param {ValueKeyFn|SortOptions} [options]
 */
export default async function sortBuiltin(treelike, options) {
  const tree = await getTreeArgument(this, arguments, treelike, "tree:sort");
  return sortFn.call(this, options)(tree);
}

helpRegistry.set(
  "tree:sort",
  "(tree, options) - \tA new tree with its keys sorted"
);
