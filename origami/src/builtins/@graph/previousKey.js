import { Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Returns the key before the indicated key.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 *
 * @param {Graphable} graphable
 * @param {any} key
 * @this {AsyncDictionary|null}
 */
export default async function previousKey(graphable, key) {
  assertScopeIsDefined(this);
  const graph = Graph.from(graphable);
  let previousKey = undefined;
  for (const graphKey of await graph.keys()) {
    if (graphKey === key) {
      return previousKey;
    }
    previousKey = graphKey;
  }
  return undefined;
}

previousKey.usage = `previousKey <graph>, <key>\tReturns the key before the indicated key`;
previousKey.documentation =
  "https://graphorigami.org/cli/builtins.html#previousKey";
