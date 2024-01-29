import { Tree } from "@weborigami/async-tree";
import getTreeArgument from "../../misc/getTreeArgument.js";

/**
 * Return the interior nodes of the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function plain(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike);
  return Tree.plain(tree);
}

plain.usage = `plain <tree>\tA plain JavaScript object representation of the tree`;
plain.documentation = "https://weborigami.org/cli/builtins.html#plain";
