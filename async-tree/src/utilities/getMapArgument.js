import from from "../operations/from.js";
import isUnpackable from "./isUnpackable.js";

/**
 * Convert the indicated argument to a map, or throw an exception.
 *
 * Tree operations can use this to validate the map argument and provide more
 * helpful error messages. This also unpacks a unpackable map argument.
 *
 * @typedef {import("../../index.ts").AsyncMap} AsyncMap
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").Unpackable} Unpackable
 *
 * @param {Maplike|Unpackable} maplike
 * @param {string} operation
 * @param {{ deep?: boolean, position?: number }} [options]
 * @returns {Promise<Map|AsyncMap>}
 */
export default async function getMapArgument(maplike, operation, options = {}) {
  const deep = options.deep;
  const position = options.position ?? 0;

  if (isUnpackable(maplike)) {
    maplike = await maplike.unpack();
  }

  let map;
  try {
    map = from(maplike, { deep });
  } catch (/** @type {any} */ error) {
    let message = error.message ?? error;
    message = `${operation}: ${message}`;
    const newError = new TypeError(message);
    /** @type {any} */ (newError).position = position;
    throw newError;
  }
  return map;
}
