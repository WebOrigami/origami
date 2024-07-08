import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

const fnPromiseMap = new WeakMap();

/**
 * Evaluate the given function only once and cache the result.
 *
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @this {AsyncTree|null}
 * @param {Function} fn
 */
export default async function once(fn) {
  assertTreeIsDefined(this, "once");
  if (!fnPromiseMap.has(fn)) {
    fnPromiseMap.set(fn, fn.call(this));
  }
  return fnPromiseMap.get(fn);
}
