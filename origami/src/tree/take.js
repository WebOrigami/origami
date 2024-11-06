import getTreeArgument from "../misc/getTreeArgument.js";
import takeFn from "./takeFn.js";

/**
 * Given a tree, take the first n items from it.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {number} n
 */
export default async function take(treelike, n) {
  const tree = await getTreeArgument(this, arguments, treelike, "@take");
  return takeFn.call(this, n)(tree);
}

take.usage = `@take tree, n\tReturn the first n items from tree`;
take.documentation = "https://weborigami.org/cli/builtins.html#take";
