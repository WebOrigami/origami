import groupFn from "./groupFn.js";

/**
 * Given a function that returns a grouping key for a value, returns a transform
 * that applies that grouping function to a tree.
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {import("../../index.ts").ValueKeyFn} groupKeyFn
 */
export default function group(treelike, groupKeyFn) {
  return groupFn(groupKeyFn)(treelike);
}
