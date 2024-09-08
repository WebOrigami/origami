/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */

import { evaluate } from "./internal.js";

/**
 * Given parsed Origami code, return a function that executes that code.
 *
 * @param {import("../../index.js").ParseResult} parsed - parsed Origami expression
 * @param {string} [name] - optional name of the function
 */
export function createExpressionFunction(parsed, name) {
  /** @this {AsyncTree|null} */
  async function fn() {
    return evaluate.call(this, parsed);
  }
  if (name) {
    Object.defineProperty(fn, "name", { value: name });
  }
  fn.code = parsed;
  fn.toString = () =>
    parsed instanceof Array ? parsed.location.source.text : parsed;
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
