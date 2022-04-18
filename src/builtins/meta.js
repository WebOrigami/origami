import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import MetaTransform from "../framework/MetaTransform.js";
import defaultGraph from "./defaultGraph.js";

/**
 * Evaluate the formulas in the keys of the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function meta(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  const transformed = transformObject(MetaTransform, graph);
  transformed.parent = this ?? (await defaultGraph());
  return transformed;
}

meta.usage = `meta <graph>\tEvaluate the formulas in the keys of the graph`;
meta.documentation = "https://explorablegraph.org/cli/builtins.html#meta";
