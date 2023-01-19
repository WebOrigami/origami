import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Return the in-order exterior values of a graph as a flat array.
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

valuesDeep.usage = `valuesDeep <graph>\tThe in-order graph values as a flat array`;
valuesDeep.documentation =
  "https://graphorigami.org/cli/builtins.html#valuesDeep";
