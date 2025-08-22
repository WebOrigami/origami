import { Tree } from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";

/**
 * Return the interior nodes of the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function plain(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "plain");
  return Tree.plain(tree);
}
