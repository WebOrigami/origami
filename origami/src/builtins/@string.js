import { toString } from "../common/utilities.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Convert an object to a string.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @this {AsyncTree|null}
 * @param {any} object
 */
export default function stringBuiltin(object) {
  assertScopeIsDefined(this, "string");
  return toString(object);
}
