import deepValuesIterator from "./deepValuesIterator.js";

/**
 * Return the in-order exterior values of a tree as a flat array.
 *
 * @param {import("../../index.ts").Maplike} maplike
 * @param {{ expand?: boolean }} [options]
 */
export default async function deepValues(maplike, options = { expand: false }) {
  const iterator = deepValuesIterator(maplike, options);
  const values = [];
  for await (const value of iterator) {
    values.push(value);
  }
  return values;
}
