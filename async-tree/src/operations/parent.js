import { assertIsTreelike } from "../utilities.js";
import from from "./from.js";

/**
 * Returns the parent of the current tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 */
export default async function parent(treelike) {
  assertIsTreelike(treelike, "parent");
  const tree = from(treelike);
  return tree.parent;
}
