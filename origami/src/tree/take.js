import { take as takeTransform } from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";

/**
 * Given a tree, take the first n items from it.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {number} count
 */
export default async function take(treelike, count) {
  const tree = await getTreeArgument(this, arguments, treelike, "take");
  const taken = await takeTransform(tree, count);
  taken.parent = this;
  return taken;
}
