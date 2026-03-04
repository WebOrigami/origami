import * as args from "../utilities/args.js";
import isMap from "./isMap.js";
import isMaplike from "./isMaplike.js";

/**
 * Return an iterator that yields all values in a tree, including nested trees.
 *
 * If the `expand` option is true, maplike values (but not functions) will be
 * expanded into nested trees and their values will be yielded.
 *
 * @param {import("../../index.ts").Maplike} maplike
 * @param {{ depth?: number, expand?: boolean }} [options]
 * @returns {AsyncGenerator<any, void, undefined>}
 */
export default async function* deepValuesIterator(maplike, options = {}) {
  const tree = await args.map(maplike, "Tree.deepValuesIterator", {
    deep: !options.expand,
  });

  let depth = options.depth ?? Infinity;
  let expand = options.expand ?? false;

  for await (const key of tree.keys()) {
    const value = await tree.get(key);

    // Recurse into child trees, but don't expand functions.
    const recurse =
      depth > 1 &&
      (isMap(value) ||
        (expand && typeof value !== "function" && isMaplike(value)));
    if (recurse) {
      yield* deepValuesIterator(value, { depth: depth - 1, expand });
    } else {
      yield value;
    }
  }
}
