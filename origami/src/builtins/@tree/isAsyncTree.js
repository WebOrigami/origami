/** @typedef {import("@graphorigami/types").AsyncTree} AsyncTree */

import { Tree } from "@graphorigami/core";

/**
 * Return true if the value is an async tree.
 *
 * @this {AsyncTree|null}
 * @param {any} value
 */
export default function isAsyncTree(value) {
  return Tree.isAsyncTree(value);
}

isAsyncTree.usage = `@tree/isAsyncTree <value>\tReturn true for an async tree`;
isAsyncTree.documentation =
  "https://graphorigami.org/cli/builtins.html#isAsyncTree";
