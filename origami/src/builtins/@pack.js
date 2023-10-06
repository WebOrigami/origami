import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").StringLike} StringLike
 *
 * @this {AsyncDictionary|null}
 * @param {any} obj
 * @returns
 */
export default function pack(obj) {
  assertScopeIsDefined(this);
  return obj?.pack?.();
}
