import { scope, Tree } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

/**
 * Return the inherited value (if any) for the indicated key.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string[]} keys
 */
export default async function inherited(...keys) {
  assertTreeIsDefined(this, "inherited:");
  const key = keys.shift();
  if (!this?.parent) {
    return undefined;
  }
  const parentScope = scope(this.parent);
  const value = await parentScope.get(key);
  return keys.length > 0 ? await Tree.traverse(value, ...keys) : value;
}
