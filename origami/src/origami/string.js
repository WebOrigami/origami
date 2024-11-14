import assertTreeIsDefined from "../common/assertTreeIsDefined.js";
import { toString } from "../common/utilities.js";

/**
 * Convert an object to a string.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @this {AsyncTree|null}
 * @param {any} object
 */
export default function stringBuiltin(object) {
  assertTreeIsDefined(this, "origami:string");
  return toString(object);
}
