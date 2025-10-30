import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Remove all entries from the tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 */
export default async function clear(maplike) {
  const tree = await getTreeArgument(maplike, "clear");
  if ("readOnly" in tree && tree.readOnly) {
    throw new TypeError("Target must be a mutable asynchronous tree");
  }
  const promises = [];
  for await (const key of tree.keys()) {
    promises.push(tree.delete(key));
  }
  await Promise.all(promises);
  return tree;
}
