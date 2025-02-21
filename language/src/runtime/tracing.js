import { AsyncLocalStorage } from "node:async_hooks";
import codeFragment from "./codeFragment.js";
import { evaluate } from "./internal.js";

export const asyncLocalStorage = new AsyncLocalStorage();

export async function traceJavaScriptFunction(fn) {
  const trace = {};
  const result = await asyncLocalStorage.run(trace, fn);
  return { result, trace };
}

/**
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {import("../../index.ts").AnnotatedCode} code
 */
export async function traceOrigamiCode(code) {
  const tree = this;
  const trace = {};
  const result = await asyncLocalStorage.run(trace, () =>
    evaluate.call(tree, code)
  );
  return { result, trace };
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
    inputs,
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
