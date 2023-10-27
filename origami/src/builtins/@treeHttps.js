import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";
import * as ops from "../runtime/ops.js";

/**
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @typedef {import("../..").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string|Symbol} keys
 */
export default async function treeHttps(host, ...keys) {
  assertScopeIsDefined(this);
  return ops.https.call(this, host, ...keys);
}

treeHttps.usage = `@treeHttps <domain>, <...keys>\tA web site tree via HTTPS`;
treeHttps.documentation = "https://graphorigami.org/language/@treeHttps.html";
