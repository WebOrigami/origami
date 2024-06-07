import { deepReverse } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Reverse the order of keys at all levels of the tree.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function deepReverseBuiltin(treelike) {
  const tree = await getTreeArgument(this, arguments, treelike, "@deepReverse");
  let reversed = deepReverse(tree);
  reversed = Scope.treeWithScope(reversed, this);
  return reversed;
}
