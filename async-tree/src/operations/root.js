import * as symbols from "../symbols.js";
import getMapArgument from "../utilities/getMapArgument.js";

/**
 * Walk up the `parent` chain to find the root of the tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default function root(maplike) {
  /** @type {any} */
  let current = getMapArgument(maplike, "root");
  while (current.parent || current[symbols.parent]) {
    current = current.parent || current[symbols.parent];
  }
  return current;
}
