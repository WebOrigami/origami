/** @typedef {import("@graphorigami/types").AsyncTree} AsyncTree */
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import * as ops from "../language/ops.js";

/**
 * Return the inherited value (if any) for the indicated key.
 *
 * @param {any} key
 * @this {AsyncTree|null}
 */
export default async function inherited(key) {
  assertScopeIsDefined(this);
  return ops.inherited.call(this, key);
}

inherited.usage = `@inherited <key>\tThe value of the key in the tree's inherited scope`;
inherited.documentation = "https://graphorigami.org/language/@inherited.html";
