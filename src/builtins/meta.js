import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import MetaTransform from "../framework/MetaTransform.js";
import config from "./config.js";

/**
 * Evaluate the formulas in the keys of the graph.
 *
 * @this {ExecutionContext}
 * @param {GraphVariant} [variant]
 */
export default async function meta(variant) {
  variant = variant ?? this;
  const graph = ExplorableGraph.from(variant);
  const meta = transformObject(MetaTransform, graph);
  const scope = this?.scope ?? this ?? (await config());
  meta.parent = scope;
  return meta;
}

meta.usage = `meta <graph>\tEvaluate the formulas in the keys of the graph`;
meta.documentation = "https://explorablegraph.org/cli/builtins.html#meta";
