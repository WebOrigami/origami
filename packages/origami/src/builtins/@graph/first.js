import ExplorableGraph from "../../core/ExplorableGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the first value in the graph.
 *
 * @this {Explorable|null}
 * @param {GraphVariant} [variant]
 */
export default async function first(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  for (const key of await graph.keys()) {
    // Just return first value immediately.
    const value = await graph.get(key);
    return value;
  }
  return undefined;
}

first.usage = `first <graph>\tReturns the first value in the graph.`;
first.documentation = "https://graphorigami.org/cli/builtins.html#first";
