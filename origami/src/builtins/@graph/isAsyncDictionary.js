/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */

import { Dictionary } from "@graphorigami/core";

/**
 * Return true if the value is an async dictionary
 *
 * @this {AsyncDictionary|null}
 * @param {any} value
 */
export default function isAsyncDictionary(value) {
  return Dictionary.isAsyncDictionary(value);
}

isAsyncDictionary.usage = `@graph/isAsyncDictionary <value>\tReturn true for an async dictionary`;
isAsyncDictionary.documentation =
  "https://graphorigami.org/cli/builtins.html#isAsyncDictionary";
