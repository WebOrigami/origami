import sortFn from "../transforms/sortFn.js";

/**
 * Return a new tree with the original's keys sorted. A comparison function can
 * be provided; by default the keys will be sorted in [natural sort
 * order](https://en.wikipedia.org/wiki/Natural_sort_order).
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {(key: any, tree: AsyncTree) => any} SortKeyFn
 * @typedef {{ compare?: (a: any, b: any) => number, sortKey?: SortKeyFn }}
 * SortOptions
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {SortOptions} [options]
 */
export default function sort(treelike, options) {
  return sortFn(options)(treelike);
}
