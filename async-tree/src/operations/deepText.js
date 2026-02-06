import getMapArgument from "../utilities/getMapArgument.js";
import interop from "../utilities/interop.js";
import toString from "../utilities/toString.js";
import deepValuesIterator from "./deepValuesIterator.js";

/**
 * Concatenate the deep text values in a tree.
 *
 * @param {import("../../index.ts").Maplike} maplike
 */
export default async function deepText(maplike) {
  const tree = await getMapArgument(maplike, "Tree.deepText", { deep: true });
  const strings = [];
  for await (const value of deepValuesIterator(tree, { expand: true })) {
    let string;
    if (value === null) {
      string = "null";
    } else if (value === undefined) {
      string = "undefined";
    } else {
      string = toString(value);
    }
    if (value === null || value === undefined) {
      const message = `Warning: a template encountered a ${string} value.`;
      interop.warn(message);
    }
    strings.push(string);
  }
  return strings.join("");
}
