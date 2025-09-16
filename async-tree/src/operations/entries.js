import assertIsTreelike from "../utilities/assertIsTreelike.js";
import from from "./from.js";

/**
 * Returns a new `Iterator` object that contains a two-member array of `[key,
 * value]` for each element in the specific node of the tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function entries(treelike) {
  assertIsTreelike(treelike, "entries");
  const tree = from(treelike);
  const keys = Array.from(await tree.keys());
  const promises = keys.map(async (key) => [key, await tree.get(key)]);
  return Promise.all(promises);
}
