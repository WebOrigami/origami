import { sortFn } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import { toFunction } from "../common/utilities.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Return a transform function that sorts a tree's keys using a comparison
 * function.
 *
 * If the `options` include a `sortKey` function, that will be invoked for each
 * key in the tree to produce a sort key. If no `sortKey` function is provided,
 * the original keys will be used as sort keys.
 *
 * If the `options` include a `compare` function, that will be used to compare
 * sort keys.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").ValueKeyFn} ValueKeyFn
 * @typedef {{ compare?: (a: any, b: any) => number, sortKey?: ValueKeyFn }}
 * SortOptions
 *
 * @this {AsyncTree|null}
 * @param {SortOptions} [options]
 */
export default function sortFnBuiltin(options) {
  assertScopeIsDefined(this);
  const scope = this;

  const compare = options?.compare;
  let extendedSortKeyFn;
  if (options?.sortKey) {
    const originalSortKey = toFunction(options?.sortKey);
    extendedSortKeyFn = async (key, tree) => {
      const value = await tree.get(key);
      const sortKey = await originalSortKey.call(scope, value, key);
      return sortKey;
    };
  }

  const fn = sortFn({
    compare,
    sortKey: extendedSortKeyFn,
  });

  return (treelike) => {
    const sorted = fn(treelike);
    const scoped = Scope.treeWithScope(sorted, scope);
    return scoped;
  };
}

sortFnBuiltin.usage = `@sortFn [sortFn]\tReturn a function that sorts a tree`;
sortFnBuiltin.documentation = "https://weborigami.org/builtins/@sortFn.html";
