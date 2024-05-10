import deepTakeFn from "./deepTakeFn.js";

/**
 * Returns a function that traverses a tree deeply and returns the values of the
 * first `count` keys.
 *
 * This is similar to `deepValues`, but it is more efficient for large trees as
 * stops after `count` values.
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {number} count
 */
export default function deepTake(treelike, count) {
  return deepTakeFn(count)(treelike);
}
