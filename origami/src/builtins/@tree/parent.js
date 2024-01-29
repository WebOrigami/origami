import getTreeArgument from "../../misc/getTreeArgument.js";

/**
 * Returns the parent of the current tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function parent(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike);
  return tree.parent;
}

parent.usage = `parent\tThe parent of the current tree`;
parent.documentation = "https://weborigami.org/cli/builtins.html#parent";
