import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import merge from "./merge.js";

export default async function mix(...graphs) {
  // Filter out undefined graphs.
  const filtered = graphs.filter((graph) => graph !== undefined);

  // Give each graph a scope that includes the other graphs, plus the scope in
  // which this mix function is running.
  const scopedGraphs = filtered.map((graph) => {
    const otherGraphs = graphs.filter((g) => g !== graph);
    const scope = new Scope(...otherGraphs, this);
    let scopedGraph = ExplorableGraph.isExplorable(graph)
      ? Object.create(graph)
      : ExplorableGraph.from(graph);
    if (!("parent" in graph)) {
      scopedGraph = transformObject(InheritScopeTransform, scopedGraph);
    }
    scopedGraph.parent = scope;
    return scopedGraph;
  });

  // Give the overall mixed graph a scope that includes the component graphs and
  // the scope in which this mix function is running.
  const result = await merge.apply(this, scopedGraphs);
  result.scope = new Scope(result, this);

  return result;
}
