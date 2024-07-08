import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * Return the number of milliseconds required to execute the given function the
 * specified number of times.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {Function} fn
 */
export default async function perf(fn, count = 1) {
  assertTreeIsDefined(this, "perf");
  const start = performance.now();
  for (let i = 0; i < count; i++) {
    await fn.call(this);
  }
  const end = performance.now();
  const milliseconds = Math.round(end - start);
  return `${milliseconds} ms`;
}
