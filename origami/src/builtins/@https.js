import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import * as ops from "../runtime/ops.js";

/**
 * Retrieve the indicated web resource via HTTPS.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export default async function https(host, ...keys) {
  assertScopeIsDefined(this);
  return ops.https.call(this, host, ...keys);
}

https.usage = `@https <host>, <...keys>\tA web resource via HTTPS`;
https.documentation = "https://graphorigami.org/language/@https.html";
