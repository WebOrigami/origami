import isPlainObject from "../utilities/isPlainObject.js";
import isUnpackable from "../utilities/isUnpackable.js";
import map from "./map.js";

/**
 * @typedef {import("../../index.ts").AsyncMap} AsyncMap
 * @typedef {import("../../index.ts").MapExtensionOptions} MapExtensionOptions
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 */

/**
 * @overload
 * @param {Maplike} maplike
 * @param {string} extension
 */

/**
 * @overload
 * @param {Maplike} maplike
 * @param {MapExtensionOptions} options
 */

/**
 * @overload
 * @param {Maplike} maplike
 * @param {string} extension
 * @param {ValueKeyFn} fn
 */

/**
 * @overload
 * @param {Maplike} maplike
 * @param {string} extension
 * @param {MapExtensionOptions} options
 */

/**
 * Shorthand for calling `map` with the `deep: true` option.
 *
 * @param {Maplike} maplike
 * @param {string|MapExtensionOptions} arg2
 * @param {ValueKeyFn|MapExtensionOptions} [arg3]
 * @returns {Promise<AsyncMap>}
 */
export default async function mapExtension(maplike, arg2, arg3) {
  /** @type {MapExtensionOptions} */
  // @ts-ignore
  let options = { _noExtensionWarning: true };
  if (arg3 === undefined) {
    if (typeof arg2 === "string") {
      options.extension = arg2;
    } else if (isPlainObject(arg2)) {
      Object.assign(options, arg2);
    } else {
      throw new TypeError(
        "Tree.mapExtension: Expected a string or options object for the second argument.",
      );
    }
  } else {
    if (typeof arg2 !== "string") {
      throw new TypeError(
        "Tree.mapExtension: Expected a string for the second argument.",
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
        "Tree.mapExtension: Expected a function or options object for the third argument.",
      );
    }
  }

  if (!options.description) {
    options.description = `mapExtension ${options.extension}`;
  }

  return map(maplike, options);
}
