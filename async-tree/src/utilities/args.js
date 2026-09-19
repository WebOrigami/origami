import { from } from "../internal.js";
import isMaplike from "../operations/isMaplike.js";
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
 * Check a boolean argument.
 *
 * @param {boolean} arg
 * @param {string} operation
 * @param {*} options
 */
export function boolean(arg, operation, options = {}) {
  if (typeof arg !== "boolean") {
    /** @type {any} */
    const error = new TypeError(`${operation}: Expected a boolean argument.`);
    error.position = options.position ?? 1;
    throw error;
  }
  return arg;
}

/**
 * Check an options dictionary
 *
 * @param {Maplike} maplike
 * @param {string} operation
 * @param {Record<string, { type?: string, required?: boolean }>} schema
 * @param {any} options
 */
export function dictionary(maplike, operation, schema, options = {}) {
  const optionsMap = map(maplike, operation, options);

  const result = {};
  for (const [optionKey, optionSchema] of Object.entries(schema)) {
    const optionValue = optionsMap.get(optionKey);
    result[optionKey] = dictionaryEntry(
      optionValue,
      optionKey,
      operation,
      optionSchema,
      options,
    );
  }
  return result;
}

/**
 * Check an entry in an options dictionary.
 */
export function dictionaryEntry(
  optionValue,
  optionKey,
  operation,
  schema,
  options = {},
) {
  const required = schema.required ?? true;
  if (optionValue == null) {
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

  const optionType = schema.type ?? "string";
  const validators = {
    boolean,
    fn,
    number,
    string,
    stringlike,
  };
  return validators[optionType](optionValue, operation, options);
}

/**
 * Check an argument that could either be an options dictionary or a shorthand
 * that's just a function. If it's a function, return it as a dictionary with
 * the function under the specified key.
 *
 * @param {function|Maplike} arg
 * @param {string} operation
 * @param {string} fnOptionKey
 * @param {Record<string, { type?: string, required?: boolean }>} schema
 * @param {any} options
 */
export function dictionaryOrFn(
  arg,
  operation,
  fnOptionKey,
  schema = {},
  options = {},
) {
  if (isMaplike(arg) && typeof arg !== "function") {
    return dictionary(arg, operation, schema, options);
  } else if (typeof arg === "function") {
    return {
      [fnOptionKey]: arg,
    };
  } else {
    /** @type {any} */
    const error = new TypeError(
      `${operation}: Expected an options dictionary or a function.`,
    );
    error.position = 1;
    throw error;
  }
}

/**
 * Check a function argument. If it's a map, coerce it to a function.
 */
export function fn(arg, operation, options = {}) {
  if (typeof arg === "function") {
    return arg;
  } else if (isMaplike(arg)) {
    return toFunction(arg);
  } else {
    /** @type {any} */
    const error = new TypeError(`${operation}: Expected a function argument.`);
    error.position = options.position ?? 1;
    throw error;
  }
}

/**
 * Check a maplike argument and return it as a Map or AsyncMap.
 *
 * @typedef {import("../../index.ts").AsyncMap} AsyncMap
 * @typedef {import("../../index.ts").Maplike} Maplike
 *
 * @param {Maplike} arg
 * @param {string} operation
 * @param {{ deep?: boolean, position?: number }} [options]
 * @returns {Map|AsyncMap}
 */
export function map(arg, operation, options = {}) {
  const deep = options.deep;
  const position = options.position ?? 1;

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
