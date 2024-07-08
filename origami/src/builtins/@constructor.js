import { ops } from "@weborigami/language";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param  {...any} keys
 */
export default function constructor(...keys) {
  assertTreeIsDefined(this, "constructor");
  const scope = this;
  if (!scope) {
    throw new Error("@constructor requires a non-null scope.");
  }
  return ops.constructor.call(scope, ...keys);
}
