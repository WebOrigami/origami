import { merge } from "@graphorigami/async-tree";
import { Scope } from "@graphorigami/language";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Create a tree that's the result of merging the given trees.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 *
 * @this {AsyncTree|null}
 * @param {(Treelike|null)[]} trees
 */
export default async function treeMerge(...trees) {
  assertScopeIsDefined(this);

  // Filter out null or undefined trees.
  /** @type {Treelike[]}
   * @ts-ignore */
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
  const result = merge(...scopedTrees);

  // Give the overall mixed tree a scope that includes the component trees and
  // the current scope.
  /** @type {any} */ (result).scope = new Scope(result, this);

  return result;
}

treeMerge.usage = `@merge <...trees>\tMerge the given trees`;
treeMerge.documentation = "https://graphorigami.org/cli/builtins.html#@merge";
