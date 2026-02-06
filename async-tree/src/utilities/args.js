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
 * Check a number argument.
 *
 * @param {number} arg
 * @param {string} operation
 * @returns
 */
export function number(arg, operation) {
  if (typeof arg !== "number" || Number.isNaN(arg)) {
    throw new TypeError(
      `${operation}: Expected a number argument, got "${arg}".`,
    );
  }
  return arg;
}

/**
 * Check a maplike argument and return it as a Map or AsyncMap.
 *
 * @typedef {import("../../index.ts").AsyncMap} AsyncMap
 * @typedef {import("../../index.ts").Maplike} Maplike
 * @typedef {import("../../index.ts").Unpackable} Unpackable
 *
 * @param {Maplike|Unpackable} arg
 * @param {string} operation
 * @param {{ deep?: boolean, position?: number }} [options]
 * @returns {Promise<Map|AsyncMap>}
 */
export async function map(arg, operation, options = {}) {
  const deep = options.deep;
  const position = options.position ?? 1;

  if (isUnpackable(arg)) {
    arg = await arg.unpack();
  }

  let map;
  try {
    map = from(arg, { deep });
  } catch (/** @type {any} */ error) {
    let message = error.message ?? error;
    message = `${operation}: ${message}`;
    const newError = new error.constructor(message);
    /** @type {any} */ (newError).position = position;
    throw newError;
  }
  return map;
}
