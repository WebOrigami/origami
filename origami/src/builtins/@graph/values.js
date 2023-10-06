import { Dictionary, Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the interior nodes of the graph.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} [graphable]
 */
export default async function values(graphable) {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return undefined;
  }
  const graph = Graph.from(graphable);
  return Dictionary.values(graph);
}

values.usage = `values <graph>\tThe top-level values in the graph`;
values.documentation = "https://graphorigami.org/cli/builtins.html#values";
