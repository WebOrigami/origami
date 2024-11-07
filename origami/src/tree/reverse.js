import { reverse } from "@weborigami/async-tree";
import helpRegistry from "../common/helpRegistry.js";
import getTreeArgument from "../misc/getTreeArgument.js";

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
  const tree = await getTreeArgument(this, arguments, treelike, "tree:reverse");
  const reversed = reverse(tree);
  return reversed;
}

helpRegistry.set(
  "tree:reverse",
  "(tree) - Reverse the order of the tree's keys"
);
