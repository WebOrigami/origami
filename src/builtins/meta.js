import MetaTransform from "../app/MetaTransform.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
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
  const meta = transformObject(MetaTransform, graph);
  meta.parent = this ?? (await config());
  return meta;
}

meta.usage = `meta <graph>\tEvaluate the formulas in the keys of the graph`;
meta.documentation = "https://explorablegraph.org/pika/builtins.html#meta";
