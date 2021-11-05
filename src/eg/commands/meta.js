import MetaMixin from "../../app/MetaMixin.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { applyMixinToObject } from "../../core/utilities.js";
import config from "./config.js";

export default async function meta(variant = this.graph, ...path) {
  const graph = ExplorableGraph.from(variant);
  const meta = applyMixinToObject(MetaMixin, graph);
  meta.scope = await config();
  meta.context = this.graph;
  const result = path.length > 0 ? await meta.get(...path) : meta;
  return result;
}

meta.usage = `meta(graph)\tEvaluate the formulas in the keys of the graph`;
