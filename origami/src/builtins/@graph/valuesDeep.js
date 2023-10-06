import { Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the in-order exterior values of a graph as a flat array.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} [graphable]
 */
export default async function valuesDeep(graphable) {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return undefined;
  }
  return Graph.mapReduce(graphable, null, (values) => values.flat());
}

valuesDeep.usage = `valuesDeep <graph>\tThe in-order graph values as a flat array`;
valuesDeep.documentation =
  "https://graphorigami.org/cli/builtins.html#valuesDeep";
