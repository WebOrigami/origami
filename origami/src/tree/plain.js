import { Tree } from "@weborigami/async-tree";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Return the interior nodes of the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function plain(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "tree:plain");
  return Tree.plain(tree);
}
plain.description =
  "plain(tree) - Render the tree as a plain JavaScript object";
