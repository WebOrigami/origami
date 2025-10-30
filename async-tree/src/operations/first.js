import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Return the first value in the tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function first(maplike) {
  const tree = await getTreeArgument(maplike, "first");
  let firstKey;
  for await (const key of tree.keys()) {
    // Just needed to get first key
    firstKey = key;
    break;
  }
  const value = await tree.get(firstKey);
  return value;
}
