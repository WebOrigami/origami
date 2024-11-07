import { toString } from "../common/utilities.js";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

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
stringBuiltin.description = "string(obj) - Coerce the object to a string";
