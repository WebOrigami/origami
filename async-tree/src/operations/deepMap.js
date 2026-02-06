import * as args from "../utilities/args.js";
import isPlainObject from "../utilities/isPlainObject.js";
import map from "./map.js";

/**
 * Shorthand for calling `map` with the `deep: true` option.
 *
 * @typedef {import("../../index.ts").MapOptions} MapOptions
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").ValueKeyFn} ValueKeyFn
 * @typedef {import("../../index.ts").AsyncMap} AsyncMap
 *
 * @param {Maplike} maplike
 * @param {ValueKeyFn|MapOptions} options
 * @returns {Promise<AsyncMap>}
 */
export default async function deepMap(maplike, options) {
  const tree = await args.map(maplike, "Tree.deepMap", { deep: true });
  const withDeep = isPlainObject(options)
    ? // Dictionary
      { ...options, deep: true }
    : // Function
      { deep: true, value: options };
  return map(tree, withDeep);
}
