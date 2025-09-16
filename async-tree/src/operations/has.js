import assertIsTreelike from "../utilities/assertIsTreelike.js";
import from from "./from.js";

/**
 * Returns a boolean indicating whether the specific node of the tree has a
 * value for the given `key`.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @param {any} key
 */
export default async function has(treelike, key) {
  assertIsTreelike(treelike, "has");
  const tree = from(treelike);
  const value = await tree.get(key);
  return value !== undefined;
}
