import getMapArgument from "../utilities/getMapArgument.js";

/**
 * Return the keys of the map.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function keys(maplike) {
  const map = await getMapArgument(maplike, "Tree.keys");
  let keys;
  let iterable = map.keys();
  if (Symbol.asyncIterator in iterable) {
    keys = [];
    for await (const key of iterable) {
      keys.push(key);
    }
  } else {
    keys = Array.from(iterable);
  }
  return keys;
}
