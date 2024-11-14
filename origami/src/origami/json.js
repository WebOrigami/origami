/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { isUnpackable, toPlainValue } from "@weborigami/async-tree";
import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

/**
 * Render the given object in JSON format.
 *
 * @this {AsyncTree|null}
 * @param {any} [obj]
 */
export default async function json(obj) {
  assertTreeIsDefined(this, "origami:json");
  // A fragment of the logic from getTreeArgument.js
  if (arguments.length > 0 && obj === undefined) {
    throw new Error(
      "An Origami function was called with an initial argument, but its value is undefined."
    );
  }
  obj = obj ?? this;
  if (obj === undefined) {
    return undefined;
  }
  if (isUnpackable(obj)) {
    obj = await obj.unpack();
  }
  const value = await toPlainValue(obj);
  return JSON.stringify(value, null, 2);
}
