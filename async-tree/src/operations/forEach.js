import { assertIsTreelike } from "../utilities.js";
import from from "./from.js";

/**
 * Calls callbackFn once for each key-value pair present in the specific node of
 * the tree.
 *
 * @typedef {import("../../index.ts").Treelike} Treelike
 *
 * @param {Treelike} treelike
 * @param {Function} callbackFn
 */
export default async function forEach(treelike, callbackFn) {
  assertIsTreelike(treelike, "forEach");
  const tree = from(treelike);
  const keys = Array.from(await tree.keys());
  const promises = keys.map(async (key) => {
    const value = await tree.get(key);
    return callbackFn(value, key, tree);
  });
  await Promise.all(promises);
}
