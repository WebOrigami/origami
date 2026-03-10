import * as args from "../utilities/args.js";
import isUnpackable from "../utilities/isUnpackable.js";
import isMap from "./isMap.js";
import isMaplike from "./isMaplike.js";

/**
 * Return an iterator that yields all values in a tree, including nested trees.
 *
 * If the `expand` option is true, maplike values (but not functions) will be
 * expanded into nested trees and their values will be yielded. Packed values
 * will be unpacked before expanding.
 *
 * If the `depth` option is specified, the iterator will only descend to the
 * specified depth. A depth of 0 will yield values only at the tree's top level.
 *
 * @param {import("../../index.ts").Maplike} maplike
 * @param {{ depth?: number, expand?: boolean }} [options]
 * @returns {AsyncGenerator<any, void, undefined>}
 */
export default async function* deepValuesIterator(maplike, options = {}) {
  const tree = await args.map(maplike, "Tree.deepValuesIterator", {
    deep: !options.expand,
  });

  const depth = options.depth ?? Infinity;
  const expand = options.expand ?? false;

  for await (const key of tree.keys()) {
    let value = await tree.get(key);

    if (expand && isUnpackable(value)) {
      value = await value.unpack();
    }

    // Recurse into child trees, but don't expand functions.
    const recurse =
      depth > 0 &&
      (isMap(value) ||
        (expand && typeof value !== "function" && isMaplike(value)));
    if (recurse) {
      yield* deepValuesIterator(value, { depth: depth - 1, expand });
    } else {
      yield value;
    }
  }
}
