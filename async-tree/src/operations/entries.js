import getTreeArgument from "../utilities/getTreeArgument.js";
import keys from "./keys.js";

/**
 * Returns a new `Iterator` object that contains a two-member array of `[key,
 * value]` for each element in the specific node of the tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function entries(treelike) {
  const tree = await getTreeArgument(treelike, "entries");
  const treeKeys = await keys(tree);
  const promises = treeKeys.map(async (key) => [key, await tree.get(key)]);
  return Promise.all(promises);
}
