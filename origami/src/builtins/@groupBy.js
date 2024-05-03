import { groupBy } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import addValueKeyToScope from "../common/addValueKeyToScope.js";
import { toFunction } from "../common/utilities.js";
import getTreeArgument from "../misc/getTreeArgument.js";

/**
 * Return a new tree with the values from the original tree in groups.
 * The groups are determined by the given function.
 *
 * @typedef {import("../../index.ts").Invocable} Invocable
 * @typedef {import("@weborigami/async-tree").TreeTransform} TreeTransform
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @overload
 * @param {Treelike} treelike
 * @param {Invocable} groupKeyFn
 * @returns {AsyncTree}
 *
 * @overload
 * @param {Invocable} groupKeyFn
 * @returns {TreeTransform}
 *
 * @this {AsyncTree|null}
 * @param {Treelike|Invocable} param1
 * @param {Invocable} [param2]
 */
export default async function groupByBuiltin(param1, param2) {
  // Identify whether the function is the first parameter or the second.
  /** @type {AsyncTree|undefined} */
  let tree;
  /** @type {Invocable|undefined} */
  let invocable;
  if (arguments.length === 1) {
    invocable = param1;
  } else {
    tree = await getTreeArgument(this, arguments, param1, "@groupBy");
    invocable = param2;
  }

  const groupKeyFn = toFunction(invocable);
  const baseScope = Scope.getScope(this);
  async function extendedGroupKeyFn(value, key, tree) {
    const scope = addValueKeyToScope(baseScope, value, key);
    const sortKey = await groupKeyFn.call(scope, value, key, tree);
    return sortKey;
  }

  const groupByFn = groupBy(extendedGroupKeyFn);

  if (tree) {
    const grouped = await groupByFn(tree);
    const scoped = Scope.treeWithScope(grouped, this);
    return scoped;
  } else {
    return groupByFn;
  }
}

groupByBuiltin.usage = `@groupBy <tree>, [groupKeyFn]\tReturn a new tree with the original's values grouped`;
groupByBuiltin.documentation =
  "https://weborigami.org/cli/builtins.html#@group";
