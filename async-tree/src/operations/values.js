import from from "./from.js";
import keys from "./keys.js";

/**
 * Return the values in the specific node of the tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function values(treelike) {
  const tree = from(treelike);
  const treeKeys = await keys(tree);
  const promises = treeKeys.map(async (key) => tree.get(key));
  return Promise.all(promises);
}
