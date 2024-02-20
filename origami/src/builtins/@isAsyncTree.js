/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */

import { Tree } from "@weborigami/async-tree";

/**
 * Return true if the value is an async tree.
 *
 * @this {AsyncTree|null}
 * @param {any} value
 */
export default function isAsyncTree(value) {
  return Tree.isAsyncTree(value);
}

isAsyncTree.usage = `@isAsyncTree <value>\tReturn true for an async tree`;
isAsyncTree.documentation =
  "https://weborigami.org/cli/builtins.html#isAsyncTree";
