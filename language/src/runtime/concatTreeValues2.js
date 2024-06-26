import { deepStrings, toStringAsync } from "@weborigami/async-tree";

/**
 * Concatenate the text values in a tree.
 *
 * This is a map-reduce operation: convert everything to strings, then
 * concatenate the strings.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {import("@weborigami/async-tree").Treelike} treelike
 */
export default async function concatTreeValues(treelike) {
  const strings = deepStrings(treelike);
  return toStringAsync(strings);
}
