import assertIsTreelike from "../utilities/assertIsTreelike.js";
import from from "./from.js";
import isAsyncTree from "./isAsyncTree.js";
import isTreelike from "./isTreelike.js";

/**
 * Return an iterator that yields all values in a tree, including nested trees.
 *
 * If the `expand` option is true, treelike values (but not functions) will be
 * expanded into nested trees and their values will be yielded.
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {{ expand?: boolean }} [options]
 * @returns {AsyncGenerator<any, void, undefined>}
 */
export default async function* deepValuesIterator(
  treelike,
  options = { expand: false }
) {
  assertIsTreelike(treelike, "deepValuesIterator");
  const tree = from(treelike, { deep: true });

  for (const key of await tree.keys()) {
    let value = await tree.get(key);

    // Recurse into child trees, but don't expand functions.
    const recurse =
      isAsyncTree(value) ||
      (options.expand && typeof value !== "function" && isTreelike(value));
    if (recurse) {
      yield* deepValuesIterator(value, options);
    } else {
      yield value;
    }
  }
}
