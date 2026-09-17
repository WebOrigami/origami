import * as args from "../utilities/args.js";
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
 * @returns {AsyncMap}
 */
export default function mapExtension(maplike, arg2, arg3) {
  let extension;

  const schema = {
    deep: { type: "boolean", required: false },
    description: { type: "string", required: false },
    extension: { type: "string", required: false },
    inverseKey: { type: "fn", required: false },
    key: { type: "fn", required: false },
    keyNeedsSourceValue: { type: "boolean", required: false },
    value: { type: "fn", required: false },
  };

  /** @type {any} */
  let options = {};
  if (arg3 === undefined) {
    if (typeof arg2 === "string") {
      extension = args.string(arg2, "Tree.mapExtension", { position: 2 });
    } else {
      options = args.dictionary(arg2, "Tree.mapExtension", schema, {
        position: 2,
      });
      extension ??= options.extension;
    }
  } else {
    // @ts-ignore
    extension = args.string(arg2, "Tree.mapExtension", { position: 2 });
    options = args.dictionaryOrFn(arg3, "Tree.mapExtension", "value", schema, {
      position: 3,
    });
  }

  if (!extension) {
    throw new TypeError(
      "Tree.mapExtension: An extension mapping string is required.",
    );
  }

  // Our key function never needs the source value
  options.keyNeedsSourceValue = false;
  options.description ??= `mapExtension ${extension}`;

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
