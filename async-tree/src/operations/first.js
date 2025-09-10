import { Tree } from "../internal.js";
import { assertIsTreelike } from "../utilities.js";

/**
 * Return the first value in the tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} [treelike]
 */
export default async function first(treelike) {
  assertIsTreelike(treelike, "first");
  const tree = Tree.from(treelike);
  for (const key of await tree.keys()) {
    // Just return first value immediately.
    const value = await tree.get(key);
    return value;
  }
  return undefined;
}
