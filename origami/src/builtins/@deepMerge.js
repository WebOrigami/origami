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
export default async function treedeepMerge(...trees) {
  assertTreeIsDefined(this, "deepMerge");
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

treedeepMerge.usage = `@deepMerge <...trees>\tMerge the given trees deeply`;
treedeepMerge.documentation =
  "https://weborigami.org/cli/builtins.html#deepMerge";
