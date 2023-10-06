import { Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Returns the key after the indicated key.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} graphable
 * @param {any} key
 */
export default async function nextKey(graphable, key) {
  assertScopeIsDefined(this);
  const graph = Graph.from(graphable);
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
