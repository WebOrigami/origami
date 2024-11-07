import getTreeArgument from "../misc/getTreeArgument.js";
import takeFn from "./takeFn.js";

/**
 * Given a tree, take the first n items from it.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {number} n
 */
export default async function take(treelike, n) {
  const tree = await getTreeArgument(this, arguments, treelike, "tree:take");
  return takeFn.call(this, n)(tree);
}
take.description = "take(tree, n) - The first n values in the tree";
