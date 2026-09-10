import from from "../operations/from.js";
import plain from "../operations/plain.js";
import isUnpackable from "./isUnpackable.js";
import toFunction from "./toFunction.js";
import toString from "./toString.js";

/**
 * Runtime argument checking.
 *
 * These return a particular kind of argument or throw an error.
 *
 * Operations can use these to validate the arguments and provide more helpful
 * error messages.
 */

/**
 * Check a function argument.
 */
export function fn(arg, operation, options = {}) {
  if (typeof arg !== "function") {
    /** @type {any} */
    const error = new TypeError(`${operation}: Expected a function argument.`);
    error.position = options.position ?? 1;
    throw error;
  }
  return arg;
}

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
    const newError = new TypeError(message);
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
 */
export function number(arg, operation, options = {}) {
  if (typeof arg !== "number" || Number.isNaN(arg)) {
    /** @type {any} */
    const error = new TypeError(`${operation}: Expected a number argument.`);
    error.position = options.position ?? 1;
    throw error;
  }
  return arg;
}

/**
 * Check an option.
 */
export function option(object, optionKey, operation, options = {}) {
  const value = object[optionKey];

  const required = options.required ?? true;
  if (value == null) {
    if (required) {
      /** @type {any} */
      const error = new TypeError(
        `${operation}: Missing required option "${optionKey}".`,
      );
      error.position = options.position ?? 1;
      throw error;
    }
    return;
  }

  const expectedType = options.type ?? "string";
  if (typeof value !== expectedType) {
    /** @type {any} */
    const error = new TypeError(
      `${operation}: option "${optionKey}" must be a ${expectedType}.`,
    );
    error.position = options.position ?? 1;
    throw error;
  }

  return value;
}

/**
 * Check an options dictionary
 *
 * @param {Maplike} maplike
 * @param {string} operation
 * @param {Record<string, { type?: string, required?: boolean }>} schema
 */
export async function options(maplike, operation, schema) {
  const optionsMap = await map(maplike, operation);
  const optionsPlain = await plain(optionsMap);

  const result = {};
  for (const [optionKey, optionSchema] of Object.entries(schema)) {
    result[optionKey] = option(
      optionsPlain,
      optionKey,
      operation,
      optionSchema,
    );
  }
  return result;
}

/**
 * Check a string argument.
 *
 * @param {string} arg
 * @param {string} operation
 */
export function string(arg, operation, options = {}) {
  if (typeof arg !== "string") {
    /** @type {any} */
    const error = new TypeError(`${operation}: Expected a string argument.`);
    error.position = options.position ?? 1;
    throw error;
  }
  return arg;
}

/**
 * Check a stringlike argument.
 *
 * @param {import("../../index.ts").Stringlike} arg
 * @param {string} operation
 */
export function stringlike(arg, operation, options = {}) {
  const result = toString(arg);
  if (!result) {
    /** @type {any} */
    const error = new TypeError(
      `${operation}: Expected a stringlike argument.`,
    );
    error.position = options.position ?? 1;
    throw error;
  }
  return result;
}
