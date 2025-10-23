import getTreeArgument from "../utilities/getTreeArgument.js";
import keys from "./keys.js";

/**
 * Return the first value in the tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function first(treelike) {
  const tree = await getTreeArgument(treelike, "first");
  for (const key of await keys(tree)) {
    // Just return first value immediately.
    const value = await tree.get(key);
    return value;
  }
  return undefined;
}
