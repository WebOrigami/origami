import { GraphHelpers } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Returns the key after the indicated key.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} variant
 * @param {any} key
 */
export default async function nextKey(variant, key) {
  assertScopeIsDefined(this);
  const graph = GraphHelpers.from(variant);
  let returnNextKey = false;
  for (const graphKey of await graph.keys()) {
    if (returnNextKey) {
      return graphKey;
    }
    if (graphKey === key) {
      returnNextKey = true;
    }
  }
  return undefined;
}

nextKey.usage = `nextKey <graph>, <key>\tReturns the key after the indicated key`;
nextKey.documentation = "https://graphorigami.org/cli/builtins.html#nextKey";
