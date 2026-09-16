import * as args from "../utilities/args.js";
import deepEntriesIterator from "./deepEntriesIterator.js";

/**
 * Return the deep nested entries in the tree as arrays of [key, value] pairs.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function deepEntries(maplike) {
  const tree = args.map(maplike, "Tree.deepEntries");

  const iterator = deepEntriesIterator(tree, { depth: Infinity });
  const entries = [];
  for await (const entry of iterator) {
    entries.push(entry);
  }
  return entries;
}
