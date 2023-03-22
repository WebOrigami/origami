import ExplorableGraph from "../../core/ExplorableGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the interior nodes of the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function plain(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  return ExplorableGraph.plain(variant);
}

plain.usage = `plain <graph>\tA plain JavaScript object representation of the graph`;
plain.documentation = "https://graphorigami.org/cli/builtins.html#plain";
