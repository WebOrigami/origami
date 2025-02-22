import { AsyncLocalStorage } from "node:async_hooks";
import { evaluate } from "./internal.js";

export const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Return the current trace object, if there is one.
 */
export function getCurrentTrace() {
  return asyncLocalStorage.getStore();
}

/**
 * Run the given function with a new trace object, and return the result and the
 * trace.
 *
 * If the optional propagateTrace is omitted, the call will only be traced if
 * this call itself is already being traced.
 *
 * @param {() => any} fn
 * @param {boolean} [propagateTrace]
 */
export async function traceJavaScriptFunction(fn, propagateTrace) {
  const tracing = (await getCurrentTrace()) !== undefined;
  propagateTrace ??= tracing;
  const trace = propagateTrace ? {} : undefined;
  const result = await asyncLocalStorage.run(trace, fn);
  return { result, trace };
}

/**
 * Run the given Origami code with a new trace, and return the result and the
 * trace.
 *
 * If the optional propagateTrace is omitted, the call will only be traced if
 * this call itself is already being traced.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {import("../../index.ts").AnnotatedCode} code
 * @param {boolean} [propagateTrace]
 */
export async function traceOrigamiCode(code, propagateTrace) {
  const tree = this;
  const tracing = (await getCurrentTrace()) !== undefined;
  propagateTrace ??= tracing;
  const trace = propagateTrace ? {} : undefined;
  const result = await asyncLocalStorage.run(trace, () =>
    evaluate.call(tree, code)
  );
  return { result, trace };
}
