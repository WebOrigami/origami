import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Returns a function that invokes the tree's `get` method.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @returns {Promise<Function>}
 */
export default async function toFunction(maplike) {
  const tree = await getTreeArgument(maplike, "toFunction");
  return tree.get.bind(tree);
}
