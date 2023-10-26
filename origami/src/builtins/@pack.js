import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {any} obj
 * @returns
 */
export default function pack(obj) {
  assertScopeIsDefined(this);
  return obj?.pack?.();
}
