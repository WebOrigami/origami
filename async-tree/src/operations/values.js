import from from "./from.js";

/**
 * Return the values in the specific node of the tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function values(treelike) {
  const tree = from(treelike);
  const keys = Array.from(await tree.keys());
  const promises = keys.map(async (key) => tree.get(key));
  return Promise.all(promises);
}
