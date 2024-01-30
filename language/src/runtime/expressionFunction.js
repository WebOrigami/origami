/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */

import { evaluate, format } from "./internal.js";

/**
 * Given parsed Origami code, return a function that executes that code.
 *
 * @param {string|number|Array} code - parsed Origami code
 * @param {string} [name] - optional name of the function
 */
export function createExpressionFunction(code, name) {
  /** @this {AsyncTree|null} */
  async function fn() {
    return evaluate.call(this, code);
  }
  if (name) {
    Object.defineProperty(fn, "name", { value: name });
  }
  fn.code = code;
  fn.source = format(code);
  fn.toString = () => fn.source;
  return fn;
}

/**
 * Return true if the given object is a function that executes an Origami
 * expression.
 *
 * @param {any} obj
 * @returns {obj is { code: Array }}
 */
export function isExpressionFunction(obj) {
  return typeof obj === "function" && obj.code;
}
