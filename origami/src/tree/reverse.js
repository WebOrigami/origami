import { reverse } from "@weborigami/async-tree";
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
  const tree = await getTreeArgument(this, arguments, treelike, "@reverse");
  const reversed = reverse(tree);
  return reversed;
}

reverseBuiltin.usage = `@reverse <tree>\tReverses the order of the tree's top-level keys`;
reverseBuiltin.documentation = "https://weborigami.org/builtins/@reverse.html";
