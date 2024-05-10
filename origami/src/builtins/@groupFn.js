import { groupFn } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import { toFunction } from "../common/utilities.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

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
  assertScopeIsDefined(this);
  const scope = this;
  const groupKeyFn = toFunction(groupKey);
  // @ts-ignore
  const fn = groupFn(groupKeyFn);
  return async (treelike) => {
    const grouped = await fn(treelike);
    const scoped = Scope.treeWithScope(grouped, scope);
    return scoped;
  };
}

groupFnBuiltin.usage = `@groupBy <tree>, [groupKeyFn]\tReturn a new tree with the original's values grouped`;
groupFnBuiltin.documentation =
  "https://weborigami.org/cli/builtins.html#@group";
