import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import merge from "./merge.js";

export default async function mix(...graphs) {
  const scopedGraphs = graphs.map((graph) => {
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
  const result = await merge.apply(this, scopedGraphs);
  return result;
}
