import { toString } from "../utilities.js";
import deepValuesIterator from "./deepValuesIterator.js";

/**
 * Concatenate the deep text values in a tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {import("@weborigami/async-tree").Treelike} treelike
 */
export default async function concatTreeValues(treelike) {
  const strings = [];
  for await (const value of deepValuesIterator(treelike, { expand: true })) {
    if (value) {
      strings.push(toString(value));
    }
  }
  return strings.join("");
}
