import * as symbols from "../symbols.js";
import from from "./from.js";

/**
 * Walk up the `parent` chain to find the root of the tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default function root(treelike) {
  let current = from(treelike);
  while (current.parent || current[symbols.parent]) {
    current = current.parent || current[symbols.parent];
  }
  return current;
}
