import ExplorableGraph from "../../core/ExplorableGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the in-order exterior values of a graph as a flat array.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function valuesDeep(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  return ExplorableGraph.mapReduce(variant, null, (values) => values.flat());
}

valuesDeep.usage = `valuesDeep <graph>\tThe in-order graph values as a flat array`;
valuesDeep.documentation =
  "https://graphorigami.org/cli/builtins.html#valuesDeep";
