import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 *
 * @this {AsyncDictionary|null}
 * @param {any} obj
 * @returns
 */
export default function unpack(obj) {
  assertScopeIsDefined(this);
  return obj?.unpack?.();
}
