import { Tree } from "@graphorigami/core";
import MapValuesTree from "../../common/MapValuesTree.js";
import { treeWithScope } from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Expand values that can be treated as trees into trees.
 *
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function expand(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  /** @type {AsyncTree} */
  let expandedTree = new MapValuesTree(
    treelike,
    (value) => expandValue(value),
    {
      deep: true,
    }
  );
  expandedTree = treeWithScope(expandedTree, this);
  return expandedTree;
}

function expandValue(value) {
  let result;
  if (Tree.isTreelike(value)) {
    try {
      result = Tree.from(value);
    } catch (error) {
      result = value;
    }
  } else {
    result = value;
  }
  return result;
}

expand.usage = `@tree/expand <tree>\tExpand values that can be treated as trees`;
expand.documentation = "https://graphorigami.org/cli/builtins.html#@tree";
