import isPlainObject from "../utilities/isPlainObject.js";
import isUnpackable from "../utilities/isUnpackable.js";
import extensionKeyFunctions from "./extensionKeyFunctions.js";
import map from "./map.js";
import parseExtensions from "./parseExtensions.js";

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
  let extension;

  /** @type {import("../../index.ts").MapOptions} */
  let options = { keyNeedsSourceValue: false };
  let optionsArg;
  if (arg3 === undefined) {
    if (typeof arg2 === "string") {
      extension = arg2;
    } else if (isPlainObject(arg2)) {
      extension = arg2.extension;
      optionsArg = arg2;
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
    extension = arg2;
    if (isUnpackable(arg3)) {
      arg3 = await arg3.unpack();
    }
    if (typeof arg3 === "function") {
      options.value = arg3;
    } else if (isPlainObject(arg3)) {
      optionsArg = arg3;
    } else {
      throw new TypeError(
        "Tree.mapExtension: Expected a function or options object for the third argument.",
      );
    }
  }

  if (!extension) {
    throw new TypeError(
      "Tree.mapExtension: An extension mapping string is required.",
    );
  }

  if (optionsArg?.deep !== undefined) {
    options.deep = optionsArg.deep;
  }
  if (optionsArg?.description !== undefined) {
    options.description = optionsArg.description;
  }
  if (optionsArg?.value !== undefined) {
    options.value = optionsArg.value;
  }

  if (!options.description) {
    options.description = `mapExtension ${extension}`;
  }

  // Use the extension mapping to generate key and inverseKey functions
  const parsed = parseExtensions(extension);
  const keyFns = extensionKeyFunctions(
    parsed.sourceExtension,
    parsed.resultExtension,
  );
  options.key = keyFns.key;
  options.inverseKey = keyFns.inverseKey;

  return map(maplike, options);
}
