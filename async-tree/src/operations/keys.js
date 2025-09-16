import { assertIsTreelike } from "../utilities.js";
import from from "./from.js";

/**
 * Return the top-level keys in the tree as an array.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function keys(treelike) {
  assertIsTreelike(treelike, "keys");
  const tree = from(treelike);
  const keys = await tree.keys();
  return Array.from(keys);
}
