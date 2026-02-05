import execute from "./execute.js";

/**
 * Given parsed Origami code, return a function that executes that code.
 *
 * @typedef {import("../../index.ts").RuntimeState} RuntimeState
 * @typedef {import("../../index.js").AnnotatedCode} AnnotatedCode
 *
 * @param {AnnotatedCode} code - parsed Origami expression
 * @param {RuntimeState} [state] - runtime state
 */
export function createExpressionFunction(code, state) {
  async function fn() {
    return execute(code, state);
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
 * @returns {obj is AnnotatedCode}
 */
export function isExpressionFunction(obj) {
  return typeof obj === "function" && obj.code;
}
