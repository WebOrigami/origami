import { AsyncLocalStorage } from "node:async_hooks";
import { evaluate } from "./internal.js";

export const asyncLocalStorage = new AsyncLocalStorage();

export function getCurrentTrace() {
  return asyncLocalStorage.getStore();
}

/**
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
