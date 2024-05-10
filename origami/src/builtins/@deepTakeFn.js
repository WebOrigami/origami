import { deepTakeFn } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Returns a function that traverses a tree deeply and returns the values of the
 * first `count` keys.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {number} count
 */
export default function deepTakeFnBuiltin(count) {
  assertScopeIsDefined(this, "deepTakeFn");
  const scope = this;
  return async (treelike) => {
    const taken = await deepTakeFn(count)(treelike);
    const scoped = Scope.treeWithScope(taken, scope);
    return scoped;
  };
}
