import { Tree } from "@weborigami/async-tree";
import helpRegistry from "../common/helpRegistry.js";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Return the interior nodes of the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function values(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "tree:values");
  return Tree.values(tree);
}

helpRegistry.set("tree:values", "(tree) - The tree's values");
