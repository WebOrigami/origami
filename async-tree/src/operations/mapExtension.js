import getTreeArgument from "../utilities/getTreeArgument.js";
import isPlainObject from "../utilities/isPlainObject.js";
import map from "./map.js";

/**
 * Shorthand for calling `map` with the `deep: true` option.
 *
 * @typedef {import("../../index.ts").TreeMapExtensionOptions} TreeMapExtensionOptions
 * @typedef {import("../../index.ts").Treelike} Treelike
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @param {Treelike} treelike
 * @param {string} extension
 * @param {ValueKeyFn|TreeMapExtensionOptions} options
 * @returns {Promise<AsyncTree>}
 */
export default async function mapExtension(treelike, extension, options) {
  const tree = await getTreeArgument(treelike, "mapExtension");
  const withExtension = isPlainObject(options)
    ? // Dictionary
      { ...options, extension }
    : // Function
      { extension, value: options };

  return map(tree, withExtension);
}
