import getTreeArgument from "../utilities/getTreeArgument.js";
import keys from "./keys.js";

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
  const treeKeys = await keys(tree);
  const promises = treeKeys.map(async (key) => {
    const value = await tree.get(key);
    return callbackFn(value, key, tree);
  });
  await Promise.all(promises);
}
