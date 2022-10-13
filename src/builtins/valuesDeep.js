import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Return the exterio values of a graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function valuesDeep(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  return ExplorableGraph.mapReduce(variant, null, (values) => values.flat());
}

valuesDeep.usage = `valuesDeep <graph>\tThe in-order set of values in a graph`;
valuesDeep.documentation =
  "https://graphorigami.org/cli/builtins.html#valuesDeep";
