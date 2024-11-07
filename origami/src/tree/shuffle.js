import {
  default as ShuffleTransform,
  shuffle,
} from "../common/ShuffleTransform.js";
import { transformObject } from "../common/utilities.js";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Return a new tree with the original's keys shuffled
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function shuffleTree(treelike) {
  // Special case: If the treelike is an array, shuffle it directly. Otherwise
  // we'll end up shuffling the array's indexes, and if this is directly
  // displayed by the ori CLI, this will end up creating a plain object. Even
  // though this object will be created with the keys in the correct shuffled
  // order, a JS object will always return numeric keys in numeric order --
  // undoing the shuffle.
  if (Array.isArray(treelike)) {
    const array = treelike.slice();
    shuffle(array);
    return array;
  }
  const tree = await getTreeArgument(this, arguments, treelike, "tree:shuffle");
  return transformObject(ShuffleTransform, tree);
}
shuffleTree.description = "shuffle(tree) - Shuffle the keys of the tree";
