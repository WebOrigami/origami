import { addNextPrevious, symbols } from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";

/**
 * Add nextKey/previousKey properties to values.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {import("@weborigami/async-tree").Treelike} treelike
 */
export default async function addNextPreviousBuiltin(treelike) {
  const tree = await getTreeArgument(
    this,
    arguments,
    treelike,
    "tree:addNextPrevious"
  );
  const result = await addNextPrevious(tree);
  result[symbols.parent] = this;
  return result;
}
