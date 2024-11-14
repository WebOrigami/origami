import getTreeArgument from "../common/getTreeArgument.js";
import deepTakeFn from "./deepTakeFn.js";

/**
 * Returns a function that traverses a tree deeply and returns the values of the
 * first `count` keys.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {number} n
 */
export default async function deepTake(treelike, n) {
  const tree = await getTreeArgument(
    this,
    arguments,
    treelike,
    "tree:deepTake"
  );
  return deepTakeFn.call(this, n)(tree);
}
