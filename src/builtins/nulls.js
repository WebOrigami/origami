import MapValuesGraph from "../core/MapValuesGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Return a new graph with all values equal to null.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function nulls(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  return new MapValuesGraph(variant, () => null, { deep: true });
}

nulls.usage = `nulls <graph>\tReturn a new graph with all values equal to null`;
nulls.documentation = "https://graphorigami.org/cli/builtins.html#nulls";
