import { Dictionary, Graph } from "@graphorigami/core";
import MergeGraph from "../../common/MergeGraph.js";
import Scope from "../../common/Scope.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Create a graph that's the result of merging the given graphs.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {(Graphable|null)[]} graphs
 */
export default async function merge(...graphs) {
  assertScopeIsDefined(this);
  // Filter out null or undefined graphs.
  const filtered = graphs.filter((graph) => graph);

  if (filtered.length === 1) {
    // Only one graph, no need to merge.
    return filtered[0];
  }

  // If a graph can take a scope, give it one that includes the other graphs and
  // the current scope.
  const scopedGraphs = filtered.map((graph) => {
    let scopedGraph = Dictionary.isAsyncDictionary(graph)
      ? Object.create(/** @type {any} */ (graph))
      : // @ts-ignore
        Graph.from(graph);
    if ("parent" in scopedGraph) {
      const otherGraphs = graphs.filter((g) => g !== graph);
      const scope = new Scope(...otherGraphs, this);
      scopedGraph.parent = scope;
    }
    return scopedGraph;
  });

  // Merge the graphs.
  const result = new MergeGraph(...scopedGraphs);

  // Give the overall mixed graph a scope that includes the component graphs and
  // the current scope.
  /** @type {any} */ (result).scope = new Scope(result, this);

  return result;
}

merge.usage = `@merge <...graphs>\tMerge the given graphs`;
merge.documentation = "https://graphorigami.org/cli/builtins.html#@merge";
