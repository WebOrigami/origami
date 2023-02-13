import execute from "./execute.js";
import format from "./format.js";

/**
 * Given parsed Origami code, return a function that executes that code.
 *
 * @param {Array} code - parsed Origami code
 * @param {string} [name] - optional name of the function
 */
export function createExpressionFunction(code, name) {
  /** @this {Explorable} */
  async function fn() {
    return execute.call(this, code);
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
 */
export function isExpressionFunction(obj) {
  return typeof obj === "function" && obj.code;
}
