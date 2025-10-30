import getTreeArgument from "../utilities/getTreeArgument.js";

/**
 * Calls callbackFn once for each key-value pair present in the specific node of
 * the tree.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {Function} callbackFn
 */
export default async function forEach(maplike, callbackFn) {
  const tree = await getTreeArgument(maplike, "forEach");
  for await (const key of tree.keys()) {
    const value = await tree.get(key);
    await callbackFn(value, key, tree);
  }
}
