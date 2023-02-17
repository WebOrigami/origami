import ExplorableGraph from "../core/ExplorableGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Returns the parent of the current graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function parent(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  return /** @type {any} */ (graph).parent;
}

parent.usage = `parent\tThe parent of the current graph`;
parent.documentation = "https://graphorigami.org/cli/builtins.html#parent";
