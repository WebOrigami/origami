import { deepMerge } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

/**
 * Create a tree that's the result of deep merging the given trees.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike[]} trees
 */
export default async function treeDeepMerge(...trees) {
  assertTreeIsDefined(this, "tree:deepMerge");
  // Merge the trees.
  const result = deepMerge(...trees);
  result.parent = this;
  return result;
}
