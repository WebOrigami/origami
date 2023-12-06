import { Tree, sortBy } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import addValueKeyToScope from "../../common/addValueKeyToScope.js";
import { toFunction } from "../../common/utilities.js";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Return a new tree with the original's keys sorted using the given function to
 * obtain a sort key for each value in the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("../../../index.ts").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {Treelike} treelike
 * @param {Invocable} sortKeyFn
 */
export default async function sortByBuiltin(treelike, sortKeyFn) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  const tree = Tree.from(treelike);

  const fn = toFunction(sortKeyFn);
  const baseScope = Scope.getScope(this);
  async function extendedSortKeyFn(key, tree) {
    const value = await tree.get(key);
    const scope = addValueKeyToScope(baseScope, value, key);
    const sortKey = await fn.call(scope, value, key);
    return sortKey;
  }

  const sorted = sortBy(extendedSortKeyFn)(tree);
  const scoped = Scope.treeWithScope(sorted, this);
  return scoped;
}

sortByBuiltin.usage = `sortBy <tree>, [sortKeyFn]\tReturn a new tree with the original's keys sorted`;
sortByBuiltin.documentation =
  "https://graphorigami.org/cli/builtins.html#@sort";
