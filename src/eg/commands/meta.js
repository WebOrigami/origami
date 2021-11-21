import MetaMixin from "../../app/MetaMixin.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { applyMixinToObject } from "../../core/utilities.js";
import config from "./config.js";

// @ts-ignore
export default async function meta(variant = this.graph) {
  const graph = ExplorableGraph.from(variant);
  const meta = applyMixinToObject(MetaMixin, graph);
  // @ts-ignore
  meta.scope = this?.graph ?? (await config());
  return meta;
}

meta.usage = `meta(graph)\tEvaluate the formulas in the keys of the graph`;
