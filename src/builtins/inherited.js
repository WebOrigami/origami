import assertScopeIsDefined from "../language/assertScopeIsDefined.js";
import * as ops from "../language/ops.js";

/**
 * Return the inherited value (if any) for the indicated key.
 *
 * @param {any} key
 * @this {Explorable}
 */
export default async function inherited(key) {
  assertScopeIsDefined(this);
  return ops.inherited.call(this, key);
}

inherited.usage = `inherited <key>\tThe value of the key in the graph's inherited scope`;
inherited.documentation =
  "https://graphorigami.org/cli/builtins.html#inherited";
