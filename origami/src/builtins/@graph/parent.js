import { Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Returns the parent of the current graph.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Graphable
 *
 * @this {AsyncDictionary|null}
 * @param {Graphable} [graphable]
 */
export default async function parent(graphable) {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return undefined;
  }
  const graph = Graph.from(graphable);
  return /** @type {any} */ (graph).parent;
}

parent.usage = `parent\tThe parent of the current graph`;
parent.documentation = "https://graphorigami.org/cli/builtins.html#parent";
