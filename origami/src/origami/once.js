import { args, interop } from "@weborigami/async-tree";

const fnPromiseMap = new Map();
const codePromiseMap = new Map();

/**
 * Evaluate the given function only once and cache the result.
 *
 * @param {Function} fn
 */
export default async function once(fn) {
  interop.warn(
    `Now that Origami caches most results, Origami.once is no longer needed and will be removed in a future release. If you believe you have a need for it, please mention your use case in the Origami chat.`,
  );
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
