import from from "./from.js";

/**
 * Return the values in the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function values(maplike) {
  const map = from(maplike);
  let result;
  /** @type {any} */
  let iterable = map.values();
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
