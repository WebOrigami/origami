import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {any} obj
 * @returns
 */
export default function pack(obj) {
  assertScopeIsDefined(this);
  return obj?.pack?.();
}
