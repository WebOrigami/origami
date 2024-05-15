import { ops } from "@weborigami/language";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param  {...any} keys
 */
export default function constructor(...keys) {
  assertScopeIsDefined(this, "constructor");
  const scope = this;
  if (!scope) {
    throw new Error("@constructor requires a non-null scope.");
  }
  return ops.constructor.call(scope, ...keys);
}
