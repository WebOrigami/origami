import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Returns an array of `[key, value]` for each entry in the map.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function entries(treelike) {
  const tree = await getTreeArgument(treelike, "entries");
  let result;
  let iterable = tree.entries();
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
