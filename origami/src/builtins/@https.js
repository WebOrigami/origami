import { ops } from "@weborigami/language";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Retrieve the indicated web resource via HTTPS.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export default async function https(host, ...keys) {
  assertScopeIsDefined(this, "https");
  return ops.https.call(this, host, ...keys);
}

https.usage = `@https <host>, <...keys>\tA web resource via HTTPS`;
https.documentation = "https://weborigami.org/language/@https.html";
