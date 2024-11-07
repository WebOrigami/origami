import { deepMerge } from "@weborigami/async-tree";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

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
  // Filter out null or undefined trees.
  const filtered = trees.filter((tree) => tree);

  if (filtered.length === 1) {
    // Only one tree, no need to merge.
    return filtered[0];
  }

  // Merge the trees.
  const result = deepMerge(...filtered);
  return result;
}
treeDeepMerge.description = "deepMerge(...trees) - Return a deeply-merged tree";
