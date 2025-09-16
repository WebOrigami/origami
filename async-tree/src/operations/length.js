import { assertIsTreelike } from "../utilities.js";
import from from "./from.js";

/**
 * Return the number of keys in the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} [treelike]
 */
export default async function length(treelike) {
  assertIsTreelike(treelike, "length");
  const tree = from(treelike);
  const keys = Array.from(await tree.keys());
  return keys.length;
}
