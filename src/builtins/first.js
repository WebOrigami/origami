import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Return the first value in the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function first(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  for await (const key of graph) {
    const value = await graph.get(key);
    return value;
  }
  return undefined;
}

first.usage = `first <graph>\tReturn the first value in the graph.`;
first.documentation = "https://explorablegraph.org/cli/builtins.html#first";
