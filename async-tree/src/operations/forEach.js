import getTreeArgument from "../utilities/getTreeArgument.js";

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
  const tree = await getTreeArgument(treelike, "forEach");
  for await (const key of tree.keys()) {
    const value = await tree.get(key);
    await callbackFn(value, key, tree);
  }
}
