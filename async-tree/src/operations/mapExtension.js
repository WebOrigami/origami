import isPlainObject from "../utilities/isPlainObject.js";
import isUnpackable from "../utilities/isUnpackable.js";
import map from "./map.js";

/**
 * @typedef {import("../../index.ts").TreeMapExtensionOptions} TreeMapExtensionOptions
 * @typedef {import("../../index.ts").Treelike} Treelike
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 */

/**
 * @overload
 * @param {Treelike} treelike
 * @param {string} extension
 */

/**
 * @overload
 * @param {Treelike} treelike
 * @param {TreeMapExtensionOptions} options
 */

/**
 * @overload
 * @param {Treelike} treelike
 * @param {string} extension
 * @param {ValueKeyFn} fn
 */

/**
 * @overload
 * @param {Treelike} treelike
 * @param {string} extension
 * @param {TreeMapExtensionOptions} options
 */

/**
 * Shorthand for calling `map` with the `deep: true` option.
 *
 * @param {Treelike} treelike
 * @param {string|TreeMapExtensionOptions} arg2
 * @param {ValueKeyFn|TreeMapExtensionOptions} [arg3]
 * @returns {Promise<AsyncTree>}
 */
export default async function mapExtension(treelike, arg2, arg3) {
  /** @type {TreeMapExtensionOptions} */
  // @ts-ignore
  let options = { _noExtensionWarning: true };
  if (arg3 === undefined) {
    if (typeof arg2 === "string") {
      options.extension = arg2;
    } else if (isPlainObject(arg2)) {
      Object.assign(options, arg2);
    } else {
      throw new TypeError(
        "mapExtension: Expected a string or options object for the second argument."
      );
    }
  } else {
    if (typeof arg2 !== "string") {
      throw new TypeError(
        "mapExtension: Expected a string for the second argument."
      );
    }
    options.extension = arg2;
    if (isUnpackable(arg3)) {
      arg3 = await arg3.unpack();
    }
    if (typeof arg3 === "function") {
      options.value = arg3;
    } else if (isPlainObject(arg3)) {
      Object.assign(options, arg3);
    } else {
      throw new TypeError(
        "mapExtension: Expected a function or options object for the third argument."
      );
    }
  }

  return map(treelike, options);
}
