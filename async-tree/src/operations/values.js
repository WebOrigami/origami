import from from "./from.js";

/**
 * Return the values in the specific node of the tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function values(maplike) {
  const tree = from(maplike);
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
