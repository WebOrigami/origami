import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Return the first value in the tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function first(treelike) {
  const tree = await getTreeArgument(treelike, "first");
  let firstKey;
  for await (const key of tree.keys()) {
    // Just needed to get first key
    firstKey = key;
    break;
  }
  const value = await tree.get(firstKey);
  return value;
}
