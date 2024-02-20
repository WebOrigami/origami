import { Scope } from "@weborigami/language";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Cast the indicated treelike to a tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function tree(treelike) {
  let tree = await getTreeArgument(this, arguments, treelike);
  tree = Scope.treeWithScope(tree, this);
  return tree;
}

tree.usage = `@tree <treelike>\tConvert JSON, YAML, function, or plain object to a tree`;
tree.documentation = "https://weborigami.org/cli/builtins.html#tree";
