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
  return ops.constructor.call(this, ...keys);
}
