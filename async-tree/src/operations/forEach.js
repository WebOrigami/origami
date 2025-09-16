/**
 * Calls callbackFn once for each key-value pair present in the specific node of
 * the tree.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {AsyncTree} tree
 * @param {Function} callbackFn
 */
export default async function forEach(tree, callbackFn) {
  const keys = Array.from(await tree.keys());
  const promises = keys.map(async (key) => {
    const value = await tree.get(key);
    return callbackFn(value, key, tree);
  });
  await Promise.all(promises);
}
