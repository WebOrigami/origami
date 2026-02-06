import { args } from "@weborigami/async-tree";

const fnPromiseMap = new Map();
const codePromiseMap = new Map();

/**
 * Evaluate the given function only once and cache the result.
 *
 * @param {Function} fn
 */
export default async function once(fn) {
  fn = args.fn(fn, "Origami.once");
  const code = /** @type {any} */ (fn).code;
  if (code) {
    // Origami function, cache by code
    if (!codePromiseMap.has(code)) {
      // Don't wait for promise to resolve
      const promise = fn();
      codePromiseMap.set(code, promise);
    }
    return codePromiseMap.get(code);
  }

  // Regular function, cache by function
  if (!fnPromiseMap.has(fn)) {
    // Don't wait for promise to resolve
    const promise = fn();
    fnPromiseMap.set(fn, promise);
  }
  return fnPromiseMap.get(fn);
}
