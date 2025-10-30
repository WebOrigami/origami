import from from "./from.js";

/**
 * Return the values in the specific node of the tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function values(treelike) {
  const tree = from(treelike);
  let result;
  /** @type {any} */
  let iterable = tree.values();
  if (Symbol.asyncIterator in iterable) {
    result = [];
    for await (const key of iterable) {
      result.push(key);
    }
  } else {
    result = Array.from(iterable);
  }
  return result;
}
