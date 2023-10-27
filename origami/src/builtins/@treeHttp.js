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
export default async function treeHttp(host, ...keys) {
  assertScopeIsDefined(this);
  return ops.http.call(this, host, ...keys);
}

treeHttp.usage = `@treeHttp <domain>, <...keys>\tA web site tree via HTTP`;
treeHttp.documentation = "https://graphorigami.org/language/@treeHttp.html";
