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
export default async function values(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "@values");
  return Tree.values(tree);
}

values.usage = `@values <tree>\tThe top-level values in the tree`;
values.documentation = "https://weborigami.org/cli/builtins.html#values";
