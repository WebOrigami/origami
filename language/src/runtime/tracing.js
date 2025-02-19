import codeFragment from "./codeFragment.js";

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
 * @param {any} [call]
 */
export function saveTrace(result, code, inputs, call) {
  const trace = {
    code,
    result,
  };

  const args = inputs.slice(1);
  // See if the code returned one of its inputs
  const resultIsInput = args.some((arg) => arg === result);
  // For now avoid cycles
  if (inputs.length > 0 && !resultIsInput) {
    trace.inputs = inputs;
  }

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
 * @param {any} expectedResult
 * @param {any} newResult
 */
export function updateTrace(expectedResult, newResult) {
  const lastResult = globalThis.$origamiLastTrace?.result;
  if (lastResult !== undefined && lastResult !== expectedResult) {
    throw new Error("Internal error recording diagnostic trace information");
  }
  globalThis.$origamiLastTrace.result = newResult;
}
