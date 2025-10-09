/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import { isUnpackable, toPlainValue } from "@weborigami/async-tree";
import YAML from "yaml";

/**
 * Render the object as text in YAML format.
 *
 * @param {any} [obj]
 */
export default async function yamlBuiltin(obj) {
  // A fragment of the logic from getTreeArgument.js
  if (arguments.length > 0 && obj === undefined) {
    throw new Error(
      "An Origami function was called with an initial argument, but its value is undefined."
    );
  }
  if (obj === undefined) {
    return undefined;
  }
  if (isUnpackable(obj)) {
    obj = await obj.unpack();
  }
  const value = await toPlainValue(obj);
  return YAML.stringify(value);
}
