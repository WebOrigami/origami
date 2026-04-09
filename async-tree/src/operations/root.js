import * as symbols from "../symbols.js";
import from from "./from.js";

/**
 * Walk up the `parent` chain to find the root of the tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default function root(maplike) {
  /** @type {any} */
  let current = from(maplike);
  while (current.parent || current[symbols.parent]) {
    current = current.parent || current[symbols.parent];
  }
  return current;
}
