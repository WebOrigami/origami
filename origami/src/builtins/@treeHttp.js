import { ops } from "@weborigami/language";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("../../index.ts").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string|Symbol} keys
 */
export default function treeHttp(host, ...keys) {
  assertScopeIsDefined(this, "treeHttp");
  return ops.treeHttp.call(this, host, ...keys);
}

treeHttp.usage = `@treeHttp <domain>, <...keys>\tA web site tree via HTTP`;
treeHttp.documentation = "https://weborigami.org/language/@treeHttp.html";
