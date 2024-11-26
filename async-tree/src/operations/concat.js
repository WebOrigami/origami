import { toString } from "../utilities.js";
import deepValuesIterator from "./deepValuesIterator.js";

/**
 * Concatenate the deep text values in a tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {import("../../index.ts").Treelike} treelike
 */
export default async function concatTreeValues(treelike) {
  if (!treelike) {
    const error = new TypeError(`concat: The tree isn't defined.`);
    /** @type {any} */ (error).position = 0;
    throw error;
  }

  const strings = [];
  for await (const value of deepValuesIterator(treelike, { expand: true })) {
    let string;
    if (value === null) {
      console.warn("Warning: Origami template encountered a null value");
      string = "null";
    } else if (value === undefined) {
      console.warn("Warning: Origami template encountered an undefined value");
      string = "undefined";
    } else {
      string = toString(value);
    }
    strings.push(string);
  }
  return strings.join("");
}
