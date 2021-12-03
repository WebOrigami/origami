import MetaMixin from "../../app/MetaMixin.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { applyMixinToObject } from "../../core/utilities.js";
import config from "./config.js";

/**
 * Evaluate the formulas in the keys of the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function meta(variant) {
  variant = variant ?? this;
  const graph = ExplorableGraph.from(variant);
  const meta = applyMixinToObject(MetaMixin, graph);
  meta.scope = this ?? (await config());
  return meta;
}

meta.usage = `meta(graph)\tEvaluate the formulas in the keys of the graph`;
