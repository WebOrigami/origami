import codeFragment from "./codeFragment.js";

export function lastTrace(expectedResult) {
  if (expectedResult !== undefined) {
    const lastResult = globalThis.$origamiTrace?.result;
    if (lastResult !== undefined && lastResult !== expectedResult) {
      debugger;
    }
  }
  return globalThis.$origamiTrace;
}

/**
 * Save tracing information.
 *
 * @param {any} result
 * @param {import("../../index.ts").AnnotatedCode} code
 * @param {any[]} inputs
 * @param {any} [call]
 * @returns
 */
export function saveTrace(result, code, inputs, call) {
  // if (code[0] === ops.literal) {
  //   // Don't trace literals
  //   return result;
  // } else if (code[0] === ops.external) {
  //   // ops.external wraps ops.scope, no need to add more tracing info
  //   return result;
  // }

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

  Object.defineProperty(globalThis, "$origamiTrace", {
    configurable: true,
    enumerable: false,
    value: trace,
    writable: true,
  });
}
