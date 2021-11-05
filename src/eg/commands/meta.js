import MetaMixin from "../../app/MetaMixin.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { applyMixinToObject } from "../../core/utilities.js";

export default async function meta(variant = this.graph, ...path) {
  const graph = ExplorableGraph.from(variant);

  const meta = applyMixinToObject(MetaMixin, graph);
  meta.context = this.graph;
  meta.scope = this.graph.scope;

  const result = path.length > 0 ? await meta.get(...path) : meta;
  return result;
}

meta.usage = `meta(graph)\tEvaluate the formulas in the keys of the graph`;
