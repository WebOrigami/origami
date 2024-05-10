import { takeFn } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Limit the number of keys to the indicated count.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {number} count
 */
export default function takeFnBuiltin(count) {
  assertScopeIsDefined(this, "takeFn");
  const scope = this;
  return (treelike) => {
    const taken = takeFn(count)(treelike);
    const scoped = Scope.treeWithScope(taken, scope);
    return scoped;
  };
}
