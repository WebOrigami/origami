import { reverse } from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";

/**
 * Reverse the order of the top-level keys in the tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function reverseBuiltin(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "reverse");
  const reversed = reverse(tree);
  return reversed;
}
