import getTreeArgument from "../misc/getTreeArgument.js";
import groupFn from "./groupFn.js";

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
  const tree = await getTreeArgument(this, arguments, treelike, "@sort");
  return groupFn.call(this, groupKey)(tree);
}

groupBuiltin.usage = `@group <tree>, <fn>\tGroup a tree's values using the given function`;
groupBuiltin.documentation = "https://weborigami.org/builtins/@group.html";
