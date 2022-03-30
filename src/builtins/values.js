import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Return the interior nodes of the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function values(variant) {
  variant = variant ?? (await this.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  return ExplorableGraph.values(variant);
}

values.usage = `values <graph>\tThe top-level values in the graph`;
values.documentation = "https://explorablegraph.org/cli/builtins.html#values";
