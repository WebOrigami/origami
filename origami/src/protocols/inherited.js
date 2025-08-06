import { scope, Tree } from "@weborigami/async-tree";
import { attachWarning } from "@weborigami/language";
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
  assertTreeIsDefined(this, "inherited");
  const key = keys.shift();
  if (!this?.parent) {
    return undefined;
  }
  const parentScope = scope(this.parent);
  const value = await parentScope.get(key);
  const result = keys.length > 0 ? await Tree.traverse(value, ...keys) : value;
  return attachWarning(
    result,
    "The inherited protocol is deprecated. In most cases it can be dropped."
  );
}
