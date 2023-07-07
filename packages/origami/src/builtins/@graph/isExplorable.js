/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */

import { DictionaryHelpers } from "@graphorigami/core";

/**
 * Return true if the value is explorable
 *
 * @this {AsyncDictionary|null}
 * @param {any} value
 */
export default function isExplorable(value) {
  return DictionaryHelpers.isAsyncDictionary(value);
}

isExplorable.usage = `@graph/isExplorable <value>\tReturn true if value is explorable`;
isExplorable.documentation =
  "https://graphorigami.org/cli/builtins.html#isExplorable";
