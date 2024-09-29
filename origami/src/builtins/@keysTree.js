import { ops } from "@weborigami/language";
import assertTreeIsDefined from "../misc/assertTreeIsDefined.js";

/**
 * @typedef  {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("../../index.ts").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string|Symbol} keys
 */
export default function keysTree(host, ...keys) {
  assertTreeIsDefined(this, "keysTree");
  return ops.keysTree.call(this, host, ...keys);
}
