import { groupFn } from "@weborigami/async-tree";
import { toFunction } from "../common/utilities.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Return a function that maps a tree to a new tree with the values from the
 * original tree grouped by the given function.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {import("../../index.ts").Invocable} groupKey
 */
export default function groupFnBuiltin(groupKey) {
  assertTreeIsDefined(this, "groupFn");
  const tree = this;

  const groupKeyFn = toFunction(groupKey);
  // Have the group key function run in this tree.
  const extendedGroupKeyFn = groupKeyFn.bind(tree);

  // @ts-ignore
  const fn = groupFn(extendedGroupKeyFn);
  return async (treelike) => {
    const grouped = await fn(treelike);
    grouped.parent = tree;
    return grouped;
  };
}
