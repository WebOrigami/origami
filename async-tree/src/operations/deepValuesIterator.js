import getTreeArgument from "../utilities/getTreeArgument.js";
import isAsyncTree from "./isAsyncTree.js";
import isMaplike from "./isMaplike.js";

/**
 * Return an iterator that yields all values in a tree, including nested trees.
 *
 * If the `expand` option is true, maplike values (but not functions) will be
 * expanded into nested trees and their values will be yielded.
 *
 * @param {import("../../index.ts").Maplike} maplike
 * @param {{ expand?: boolean }} [options]
 * @returns {AsyncGenerator<any, void, undefined>}
 */
export default async function* deepValuesIterator(
  maplike,
  options = { expand: false }
) {
  const tree = await getTreeArgument(maplike, "deepValuesIterator", {
    deep: true,
  });

  for await (const key of tree.keys()) {
    const value = await tree.get(key);

    // Recurse into child trees, but don't expand functions.
    const recurse =
      isAsyncTree(value) ||
      (options.expand && typeof value !== "function" && isMaplike(value));
    if (recurse) {
      yield* deepValuesIterator(value, options);
    } else {
      yield value;
    }
  }
}
