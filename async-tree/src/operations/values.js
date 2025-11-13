import getMapArgument from "../utilities/getMapArgument.js";

/**
 * Return the values in the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function values(maplike) {
  const map = await getMapArgument(maplike, "values");
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
