import * as symbols from "../symbols.js";
import * as args from "../utilities/args.js";

/**
 * Walk up the `parent` chain to find the root of the tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function root(maplike) {
  /** @type {any} */
  let current = await args.map(maplike, "Tree.root");
  while (current.parent || current[symbols.parent]) {
    current = current.parent || current[symbols.parent];
  }
  return current;
}
