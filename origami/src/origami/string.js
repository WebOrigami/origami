import helpRegistry from "../common/helpRegistry.js";
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

helpRegistry.set(
  "origami:string",
  "(obj) - Coerce a buffer or document to a string"
);
