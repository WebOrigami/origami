import { Tree } from "@weborigami/async-tree";
import { ops } from "@weborigami/language";
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
  const value = await ops.inherited.call(this, key);
  return keys.length > 0 ? await Tree.traverse(value, ...keys) : value;
}
