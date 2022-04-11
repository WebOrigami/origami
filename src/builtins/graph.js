import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Cast the indicated variant to a graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function graph(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  return ExplorableGraph.from(variant);
}

graph.usage = `graph <variant>\tConvert JSON, YAML, function, or plain object to a graph`;
graph.documentation = "https://explorablegraph.org/cli/builtins.html#graph";
