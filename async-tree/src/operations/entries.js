/**
 * Returns a new `Iterator` object that contains a two-member array of `[key,
 * value]` for each element in the specific node of the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {AsyncTree} tree
 */
export default async function entries(tree) {
  const keys = Array.from(await tree.keys());
  const promises = keys.map(async (key) => [key, await tree.get(key)]);
  return Promise.all(promises);
}
