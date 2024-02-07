import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Return the number of milliseconds required to execute the given function the
 * specified number of times.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {Function} fn
 */
export default async function perf(fn, count = 10000) {
  assertScopeIsDefined(this);
  const start = performance.now();
  for (let i = 0; i < count; i++) {
    await fn.call(this);
  }
  const end = performance.now();
  return end - start;
}
