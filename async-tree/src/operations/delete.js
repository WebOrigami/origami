/**
 * Removes the value for the given key from the specific node of the tree.
 *
 * @typedef {import("../../index.ts").SyncOrAsyncMap} SyncOrAsyncMap
 *
 * @param {SyncOrAsyncMap} tree
 * @param {any} key
 */
// `delete` is a reserved word in JavaScript, so we use `del` instead.
export default async function del(tree, key) {
  return tree.delete(key);
}
