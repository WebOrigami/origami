/**
 * Returns a boolean indicating whether the specific node of the tree has a
 * value for the given `key`.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {AsyncTree} tree
 * @param {any} key
 */
export default async function has(tree, key) {
  const value = await tree.get(key);
  return value !== undefined;
}
