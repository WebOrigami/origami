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
export default function treeHttps(host, ...keys) {
  assertScopeIsDefined(this, "treeHttps");
  return ops.treeHttps.call(this, host, ...keys);
}

treeHttps.usage = `@treeHttps <domain>, <...keys>\tA web site tree via HTTPS`;
treeHttps.documentation = "https://weborigami.org/language/@treeHttps.html";
