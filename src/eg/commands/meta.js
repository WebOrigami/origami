import MetaMixin from "../../app/MetaMixin.js";
import Compose from "../../common/Compose.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { applyMixinToObject } from "../../core/utilities.js";
import config from "./config.js";

export default async function meta(variant = this.graph, ...path) {
  const graph = ExplorableGraph.from(variant);

  const meta = applyMixinToObject(MetaMixin, graph);
  meta.context = this.graph;
  const baseScope = this?.scope ?? (await config());
  meta.scope = new Compose(meta, baseScope);

  const result = path.length > 0 ? await meta.get(...path) : meta;
  return result;
}

meta.usage = `meta(graph)\tEvaluate the formulas in the keys of the graph`;
