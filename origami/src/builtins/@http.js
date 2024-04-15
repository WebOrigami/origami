import { ops } from "@weborigami/language";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Retrieve the indicated web resource via HTTP.
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export default async function http(host, ...keys) {
  assertScopeIsDefined(this, "http");
  return ops.http.call(this, host, ...keys);
}

http.usage = `@http <host>, <...keys>\tA web resource via HTTP`;
http.documentation = "https://weborigami.org/language/@http.html";
