import Scope from "../common/Scope.js";
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

  // If graph already appears to be a metagraph, return it as is.
  if ("formulas" in graph) {
    return graph;
  }

  const transformed = transformObject(MetaTransform, graph);

  let parent = this;
  if (!parent) {
    // Get the scope of the default graph.
    // Remove the default graph itself from its scope.
    // HACK: This uses too much knowledge about Scope.
    const graphDefault = await defaultGraph();
    const scope = graphDefault.scope;
    const graphs = scope.graphs;
    graphs.shift(); // Remove default graph from scope.
    parent = new Scope(...graphs);
  }
  transformed.parent = parent;
  return transformed;
}

meta.usage = `meta <graph>\tEvaluate the formulas in the keys of the graph`;
meta.documentation = "https://graphorigami.org/cli/builtins.html#meta";
