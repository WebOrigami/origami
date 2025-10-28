import AsyncMap from "../drivers/AsyncMap.js";
import has from "./has.js";

/**
 * Removes the value for the given key from the specific node of the tree.
 *
 * @typedef {import("@weborigami/types").AsyncMutableTree} AsyncMutableTree
 * @typedef {import("../../index.ts").SyncOrAsyncMap} SyncOrAsyncMap
 *
 * @param {AsyncMutableTree|SyncOrAsyncMap} tree
 * @param {any} key
 */
// `delete` is a reserved word in JavaScript, so we use `del` instead.
export default async function del(tree, key) {
  const exists = await has(tree, key);
  if (exists) {
    if (tree instanceof Map || tree instanceof AsyncMap) {
      await tree.delete(key);
    } else {
      // TODO: Remove when Tree classes are gone
      await tree.set(key, undefined);
    }
    return true;
  } else {
    return false;
  }
}
