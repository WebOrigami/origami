import takeFn from "../transforms/takeFn.js";

/**
 * Returns a new tree with the number of keys limited to the indicated count.
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {number} count
 */
export default function take(treelike, count) {
  return takeFn(count)(treelike);
}
