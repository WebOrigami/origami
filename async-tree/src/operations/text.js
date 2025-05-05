import { assertIsTreelike, toString } from "../utilities.js";
import deepValuesIterator from "./deepValuesIterator.js";

/**
 * Concatenate the deep text values in a tree.
 *
 * @param {import("../../index.ts").Treelike} treelike
 */
export default async function text(treelike) {
  assertIsTreelike(treelike, "text");

  const strings = [];
  for await (const value of deepValuesIterator(treelike, { expand: true })) {
    let string;
    if (value === null) {
      string = "null";
    } else if (value === undefined) {
      string = "undefined";
    } else {
      string = toString(value);
    }
    if (value === null || value === undefined) {
      const message = `Warning: a template encountered a ${string} value. To locate where this happened, build your project and search your build output for the text "${string}".`;
      console.warn(message);
    }
    strings.push(string);
  }
  return strings.join("");
}
