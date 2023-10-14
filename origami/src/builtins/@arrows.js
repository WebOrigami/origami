import { keySymbol } from "../common/utilities.js";
import ArrowGraph from "../framework/ArrowGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Interpret arrow keys in the graph as function calls.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} [graphable]
 */
export default async function arrows(graphable) {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return undefined;
  }
  const graph = new ArrowGraph(graphable, { deep: true });
  graph[keySymbol] = "@arrows";
  graph.parent = this;
  return graph;
}

arrows.usage = `@arrows <obj>\tInterpret arrow keys in the graph as function calls`;
arrows.documentation = "https://graphorigami.org/language/@arrows.html";
