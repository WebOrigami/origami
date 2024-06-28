import deepValuesIterator from "./deepValuesIterator.js";

/**
 * Return the in-order exterior values of a tree as a flat array.
 *
 * @param {import("../../index.ts").Treelike} treelike
 * @param {{ expand?: boolean }} [options]
 */
export default async function deepValues(
  treelike,
  options = { expand: false }
) {
  const iterator = deepValuesIterator(treelike, options);
  const values = [];
  for await (const value of iterator) {
    values.push(value);
  }
  return values;
}
