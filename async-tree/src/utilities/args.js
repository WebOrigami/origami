import from from "../operations/from.js";
import isUnpackable from "./isUnpackable.js";

/**
 * Runtime argument checking.
 *
 * These return a particular kind of argument or throw an error.
 *
 * Operations can use these to validate the arguments and provide more helpful
 * error messages.
 */

/**
 * Return a map
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
export async function map(maplike, operation, options = {}) {
  const deep = options.deep;
  const position = options.position ?? 1;

  if (isUnpackable(maplike)) {
    maplike = await maplike.unpack();
  }

  let map;
  try {
    map = from(maplike, { deep });
  } catch (/** @type {any} */ error) {
    let message = error.message ?? error;
    message = `${operation}: ${message}`;
    const newError = new error.constructor(message);
    /** @type {any} */ (newError).position = position;
    throw newError;
  }
  return map;
}
