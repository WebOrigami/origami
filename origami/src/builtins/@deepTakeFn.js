import { deepTakeFn } from "@weborigami/async-tree";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

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
  assertTreeIsDefined(this, "deepTakeFn");
  const parent = this;
  return async (treelike) => {
    const taken = await deepTakeFn(count)(treelike);
    taken.parent = parent;
    return taken;
  };
}
