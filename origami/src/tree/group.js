import { group as groupTransform } from "@weborigami/async-tree";
import getTreeArgument from "../common/getTreeArgument.js";
import { toFunction } from "../common/utilities.js";

/**
 * Map a tree to a new tree with the values from the original tree grouped by
 * the given function.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {import("@weborigami/async-tree").Treelike} treelike
 * @param {import("../../index.ts").Invocable} groupKey
 */
export default async function groupBuiltin(treelike, groupKey) {
  const tree = await getTreeArgument(this, arguments, treelike, "group");

  const groupKeyFn = toFunction(groupKey);
  // Have the group key function run in this tree.
  const extendedGroupKeyFn = groupKeyFn.bind(tree);

  // @ts-ignore
  const grouped = await groupTransform(tree, extendedGroupKeyFn);
  grouped.parent = tree;
  return grouped;
}
