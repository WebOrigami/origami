import { Dictionary, Tree } from "@graphorigami/core";
import MergeTree from "../../common/MergeTree.js";
import Scope from "../../common/Scope.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Create a tree that's the result of merging the given trees.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncDictionary|null}
 * @param {(Treelike|null)[]} trees
 */
export default async function merge(...trees) {
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
    let scopedTree = Dictionary.isAsyncDictionary(tree)
      ? Object.create(/** @type {any} */ (tree))
      : // @ts-ignore
        Tree.from(tree);
    if ("parent" in scopedTree) {
      const otherTrees = trees.filter((g) => g !== tree);
      const scope = new Scope(...otherTrees, this);
      scopedTree.parent = scope;
    }
    return scopedTree;
  });

  // Merge the trees.
  const result = new MergeTree(...scopedTrees);

  // Give the overall mixed tree a scope that includes the component trees and
  // the current scope.
  /** @type {any} */ (result).scope = new Scope(result, this);

  return result;
}

merge.usage = `@merge <...trees>\tMerge the given trees`;
merge.documentation = "https://graphorigami.org/cli/builtins.html#@merge";
