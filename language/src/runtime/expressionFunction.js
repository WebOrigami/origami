/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */

import { evaluate } from "./internal.js";

/**
 * Given parsed Origami code, return a function that executes that code.
 *
 * @param {import("../../index.js").AnnotatedCode} code - parsed Origami expression
 * @param {AsyncTree} parent - the parent tree in which the code is running
 */
export function createExpressionFunction(code, parent) {
  async function fn() {
    return evaluate(code, {
      container: parent,
    });
  }
  fn.code = code;
  fn.toString = () => code.location.source.text;
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
