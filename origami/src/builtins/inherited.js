import { ops } from "@weborigami/language";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Return the inherited value (if any) for the indicated key.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {any} key
 * @this {AsyncTree|null}
 */
export default async function inherited(key) {
  assertTreeIsDefined(this, "inherited:");
  return ops.inherited.call(this, key);
}

inherited.description = "Retrieve an inherited value instead of a local one";
