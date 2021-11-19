import MetaMixin from "../../app/MetaMixin.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { applyMixinToObject } from "../../core/utilities.js";
import config from "./config.js";

export default async function meta(variant = this.graph, ...keys) {
  const graph = ExplorableGraph.from(variant);
  const meta = applyMixinToObject(MetaMixin, graph);
  meta.scope = this?.graph ?? (await config());
  return keys.length > 0 ? await ExplorableGraph.traverse(meta, ...keys) : meta;
}

meta.usage = `meta(graph)\tEvaluate the formulas in the keys of the graph`;
