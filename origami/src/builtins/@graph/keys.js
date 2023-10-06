import { Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the top-level keys in the graph as an array.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} [graphable]
 */
export default async function keys(graphable) {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return undefined;
  }
  const graph = Graph.from(graphable);
  const keys = await graph.keys();
  return Array.from(keys);
}

keys.usage = `keys <graph>\tThe top-level keys in the graph`;
keys.documentation = "https://graphorigami.org/cli/builtins.html#keys";
