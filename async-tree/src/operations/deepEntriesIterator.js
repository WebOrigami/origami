import * as args from "../utilities/args.js";
import isUnpackable from "../utilities/isUnpackable.js";
import isMap from "./isMap.js";
import isMaplike from "./isMaplike.js";
/**
 * Return an iterator that yields all entries in a tree, including nested trees.
 *
 * If the `expand` option is true, maplike values (but not functions) will be
 * expanded into nested trees and their values will be yielded. Packed values
 * will be unpacked before expanding.
 *
 * If the `depth` option is specified, the iterator will only descend to the
 * specified depth. A depth of 0 will yield values only at the tree's top level.
 *
 * @param {import("../../index.ts").Maplike} maplike
 * @param {{ depth?: number, expand?: boolean, unpack?: boolean }} [options]
 * @returns {AsyncGenerator<[any, any], void, undefined>}
 */
export default async function* deepEntriesIterator(maplike, options = {}) {
  const tree = await args.map(maplike, "Tree.deepEntriesIterator", {
    deep: !options.expand,
  });

  const depth = options.depth ?? Infinity;
  const expand = options.expand ?? true;
  const unpack = options.unpack ?? false;

  for await (let [key, value] of tree.entries()) {
    value = await value;

    if (unpack && isUnpackable(value)) {
      value = await value.unpack();
    }

    // Recurse into child trees, but don't expand functions.
    const recurse =
      depth > 0 &&
      (isMap(value) ||
        (expand && typeof value !== "function" && isMaplike(value)));
    if (recurse) {
      yield* deepEntriesIterator(value, { depth: depth - 1, expand, unpack });
    } else {
      yield [key, value];
    }
  }
}
