import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Returns a function that invokes the tree's `get` method.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @returns {Promise<Function>}
 */
export default async function toFunction(treelike) {
  const tree = await getTreeArgument(treelike, "toFunction");
  return tree.get.bind(tree);
}
