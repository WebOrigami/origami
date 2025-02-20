import { AsyncLocalStorage } from "node:async_hooks";
import codeFragment from "./codeFragment.js";

export const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Retrieve the last recorded trace. If the expected result is provided, verify
 * that the last trace was for that result.
 *
 * Because trace information is volatile, this function should be called as soon
 * as possible after calling `evaluate()`, and specifically before making any
 * async calls.
 *
 * @param {any} [expectedResult]
 */
export function lastTrace(expectedResult) {
  if (expectedResult !== undefined) {
    const lastResult = globalThis.$origamiLastTrace?.result;
    if (lastResult !== undefined && lastResult !== expectedResult) {
      throw new Error("Internal error recording diagnostic trace information");
    }
  }
  return globalThis.$origamiLastTrace;
}

/**
 * Save trace information for the given result.
 *
 * @param {any} result
 * @param {import("../../index.ts").AnnotatedCode} code
 * @param {any[]} inputs
 * @param {any} call
 * @param {number} contextId
 * @param {number} parentContextId
 * @param {number} inputIndex
 */
export function saveTrace(
  result,
  code,
  inputs,
  call,
  contextId,
  parentContextId,
  inputIndex
) {
  const trace = {
    code,
    contextId,
    inputIndex,
    inputs,
    parentContextId,
    result,
  };

  if (call) {
    trace.call = call;
  }

  if (code.location) {
    trace.expression = codeFragment(code.location);
  }

  Object.defineProperty(globalThis, "$origamiLastTrace", {
    configurable: true,
    enumerable: false,
    value: trace,
    writable: true,
  });
}

/**
 * Update the last trace with a new result. This should be called if a function
 * calls `evaluate()` but then modifies its result before returning it.
 *
 * Returns the updated trace.
 *
 * @param {any} expectedResult
 * @param {any} newResult
 */
export function updateTrace(expectedResult, newResult) {
  const lastResult = globalThis.$origamiLastTrace?.result;
  if (lastResult !== undefined && lastResult !== expectedResult) {
    throw new Error("Internal error recording diagnostic trace information");
  }
  globalThis.$origamiLastTrace.result = newResult;
  return globalThis.$origamiLastTrace;
}
