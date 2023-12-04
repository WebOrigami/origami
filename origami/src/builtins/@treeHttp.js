import { ops } from "@graphorigami/language";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * @typedef  {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/async-tree").Treelike} Treelike
 * @typedef {import("../../index.ts").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string|Symbol} keys
 */
export default function treeHttp(host, ...keys) {
  assertScopeIsDefined(this);
  return ops.treeHttp.call(this, host, ...keys);
}

treeHttp.usage = `@treeHttp <domain>, <...keys>\tA web site tree via HTTP`;
treeHttp.documentation = "https://graphorigami.org/language/@treeHttp.html";
