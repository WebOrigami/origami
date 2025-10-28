import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Return the top-level keys in the tree as an array.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function keys(treelike) {
  const tree = await getTreeArgument(treelike, "keys");
  let keys;
  /** @type {any} */
  let iterable = tree.keys();
  if (Symbol.asyncIterator in iterable) {
    keys = [];
    for await (const key of iterable) {
      keys.push(key);
    }
  } else {
    // TODO: Remove when Tree classes are gone
    if (iterable instanceof Promise) {
      iterable = await iterable;
    }
    keys = Array.from(iterable);
  }
  return keys;
}
