import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Returns a boolean indicating whether the specific node of the tree has a
 * value for the given `key`.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {any} key
 */
export default async function has(maplike, key) {
  const tree = await getTreeArgument(maplike, "has");
  return tree.has(key);
}
