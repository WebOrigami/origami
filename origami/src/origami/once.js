import assertTreeIsDefined from "../common/assertTreeIsDefined.js";

const fnPromiseMap = new Map();
const codePromiseMap = new Map();

/**
 * Evaluate the given function only once and cache the result.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @this {AsyncTree|null}
 * @param {Function} fn
 */
export default async function once(fn) {
  assertTreeIsDefined(this, "origami:once");

  const code = /** @type {any} */ (fn).code;
  if (code) {
    // Origami function, cache by code
    if (!codePromiseMap.has(code)) {
      // Don't wait for promise to resolve
      const promise = fn.call(this);
      codePromiseMap.set(code, promise);
    }
    return codePromiseMap.get(code);
  }

  // Regular function, cache by function
  if (!fnPromiseMap.has(fn)) {
    // Don't wait for promise to resolve
    const promise = fn.call(this);
    fnPromiseMap.set(fn, promise);
  }
  return fnPromiseMap.get(fn);
}
