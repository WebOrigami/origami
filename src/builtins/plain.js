import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Return the interior nodes of the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function plain(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  return await ExplorableGraph.plain(variant);
}

plain.usage = `plain <graph>\tA plain JavaScript object representation of the graph`;
plain.documentation = "https://explorablegraph.org/cli/builtins.html#plain";
