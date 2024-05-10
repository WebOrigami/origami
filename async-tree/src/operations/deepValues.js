import { Tree } from "../internal.js";

/**
 * Return the in-order exterior values of a tree as a flat array.
 *
 * @param {import("../../index.ts").Treelike} treelike
 */
export default async function deepValues(treelike) {
  return Tree.mapReduce(treelike, null, async (values) => values.flat());
}
