import getTreeArgument from "../utilities/getTreeArgument.js";
import isPlainObject from "../utilities/isPlainObject.js";
import map from "./map.js";

/**
 * Shorthand for calling `map` with the `deep: true` option.
 *
 * @typedef {import("../../index.ts").TreeMapOptions} TreeMapOptions
 * @typedef {import("../../index.ts").Treelike} Treelike
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {Treelike} treelike
 * @param {ValueKeyFn|TreeMapOptions} options
 * @returns {Promise<AsyncTree>}
 */
export default async function deepMap(treelike, options) {
  const tree = await getTreeArgument(treelike, "deepMap", { deep: true });
  const withDeep = isPlainObject(options)
    ? // Dictionary
      { ...options, deep: true }
    : // Function
      { deep: true, value: options };
  return map(tree, withDeep);
}
