import * as args from "../utilities/args.js";
import deepValuesIterator from "./deepValuesIterator.js";

/**
 * Flatten the values in the tree to the given depth.
 *
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} maplike
 * @param {number} [depth] The maximum depth to flatten
 */
export default async function flat(maplike, depth = Infinity) {
  const map = await args.map(maplike, "Tree.flat", { deep: true });
  /** @type {any} */
  const iterator = deepValuesIterator(map, { depth, expand: true });
  const result = [];
  for await (const key of iterator) {
    result.push(key);
  }
  return result;
}
