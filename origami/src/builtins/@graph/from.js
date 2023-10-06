import { Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Cast the indicated graphable to a graph.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} [graphable]
 */
export default async function graph(graphable) {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return undefined;
  }
  return Graph.from(graphable);
}

graph.usage = `graph <graphable>\tConvert JSON, YAML, function, or plain object to a graph`;
graph.documentation = "https://graphorigami.org/cli/builtins.html#graph";
