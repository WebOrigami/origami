import { deepTake as deepTakeTransform } from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";

/**
 * Returns a function that traverses a tree deeply and returns the values of the
 * first `count` keys.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {number} count
 */
export default async function deepTake(treelike, count) {
  const tree = await getTreeArgument(
    this,
    arguments,
    treelike,
    "tree:deepTake",
    true
  );
  const taken = await deepTakeTransform(tree, count);
  taken.parent = this;
  return taken;
}
