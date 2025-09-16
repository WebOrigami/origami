import assertIsTreelike from "../utilities/assertIsTreelike.js";
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
 * @param {ValueKeyFn|TreeMapExtensionOptions?} operation
 * @returns {Promise<AsyncTree>}
 */
export default async function mapExtension(treelike, extension, operation) {
  assertIsTreelike(treelike, "mapExtension");
  return map(treelike, { ...operation, extension });
}
