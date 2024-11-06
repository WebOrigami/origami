import { takeFn } from "@weborigami/async-tree";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Limit the number of keys to the indicated count.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {number} count
 */
export default function takeFnBuiltin(count) {
  assertTreeIsDefined(this, "takeFn");
  const parent = this;
  return (treelike) => {
    const taken = takeFn(count)(treelike);
    taken.parent = parent;
    return taken;
  };
}
