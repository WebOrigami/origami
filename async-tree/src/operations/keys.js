import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Return the top-level keys in the tree as an array.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function keys(maplike) {
  const tree = await getTreeArgument(maplike, "keys");
  let keys;
  let iterable = tree.keys();
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
