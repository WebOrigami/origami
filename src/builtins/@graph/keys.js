import ExplorableGraph from "../../core/ExplorableGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the top-level keys in the graph as an array.
 *
 * @this {Explorable|null}
 * @param {GraphVariant} [variant]
 */
export default async function keys(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  const keys = await graph.keys();
  return Array.from(keys);
}

keys.usage = `keys <graph>\tThe top-level keys in the graph`;
keys.documentation = "https://graphorigami.org/cli/builtins.html#keys";
