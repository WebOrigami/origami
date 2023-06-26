/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import ExplorableGraph from "../../core/ExplorableGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the interior nodes of the graph.
 *
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} [variant]
 */
export default async function values(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  return ExplorableGraph.values(variant);
}

values.usage = `values <graph>\tThe top-level values in the graph`;
values.documentation = "https://graphorigami.org/cli/builtins.html#values";
