import from from "../operations/from.js";
import isUnpackable from "./isUnpackable.js";
import toFunction from "./toFunction.js";

/**
 * Runtime argument checking.
 *
 * These return a particular kind of argument or throw an error.
 *
 * Operations can use these to validate the arguments and provide more helpful
 * error messages.
 */

/**
 * Check an invocable argument and return it as a function.
 *
 * @param {import("../../index.ts").Invocable} arg
 * @param {string} operation
 * @returns {Function}
 */
export function invocable(arg, operation, options = {}) {
  const fn = toFunction(arg);
  if (!fn) {
    /** @type {any} */
    const error = new TypeError(`${operation}: Expected a function argument.`);
    error.position = options.position ?? 1;
    throw error;
  }
  return fn;
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

/**
 * Check a number argument.
 *
 * @param {number} arg
 * @param {string} operation
 * @returns
 */
export function number(arg, operation, options = {}) {
  if (typeof arg !== "number" || Number.isNaN(arg)) {
    /** @type {any} */
    const error = new TypeError(
      `${operation}: Expected a number argument, got "${arg}".`,
    );
    error.position = options.position ?? 1;
    throw error;
  }
  return arg;
}
