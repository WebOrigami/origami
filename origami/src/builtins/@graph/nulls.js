import MapValuesGraph from "../../common/MapValuesGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return a new graph with all values equal to null.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} [variant]
 */
export default async function nulls(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  return new MapValuesGraph(variant, () => null, { deep: true });
}

nulls.usage = `nulls <graph>\tReturn a new graph with all values equal to null`;
nulls.documentation = "https://graphorigami.org/cli/builtins.html#nulls";
