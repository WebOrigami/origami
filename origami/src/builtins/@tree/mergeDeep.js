import { mergeDeep } from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Create a tree that's the result of deep merging the given trees.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike[]} trees
 */
export default async function treeMergeDeep(...trees) {
  assertScopeIsDefined(this);
  // Filter out null or undefined trees.
  const filtered = trees.filter((tree) => tree);

  if (filtered.length === 1) {
    // Only one tree, no need to merge.
    return filtered[0];
  }

  // If a tree can take a scope, give it one that includes the other trees and
  // the current scope.
  const scopedTrees = filtered.map((tree) => {
    const otherTrees = filtered.filter((g) => g !== tree);
    const scope = new Scope(...otherTrees, this);
    // Each tree will be included first in its own scope.
    return Scope.treeWithScope(tree, scope);
  });

  // Merge the trees.
  const result = mergeDeep(...scopedTrees);

  // Give the overall mixed tree a scope that includes the component trees and
  // the current scope.
  /** @type {any} */ (result).scope = new Scope(result, this);

  return result;
}

treeMergeDeep.usage = `mergeDeep <...trees>\tMerge the given trees deeply`;
treeMergeDeep.documentation =
  "https://graphorigami.org/cli/builtins.html#mergeDeep";
