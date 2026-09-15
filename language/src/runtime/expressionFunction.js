import execute from "./execute.js";

/**
 * Given parsed Origami code, return a function that executes that code.
 *
 * @typedef {import("../../index.ts").ExecutionContext} ExecutionContext
 * @typedef {import("../../index.js").AnnotatedCode} AnnotatedCode
 *
 * @param {ExecutionContext} context
 */
export function createExpressionFunction(context) {
  async function fn() {
    return execute(context);
  }
  const { code } = context;
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
