import ExplorableGraph from "../../core/ExplorableGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the number of keys in the graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function count(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = await ExplorableGraph.from(variant);
  const keys = [...(await graph.keys())];
  return keys.length;
}

count.usage = `count <variant>\tReturn the number of keys in the graph`;
count.documentation = "https://graphorigami.org/cli/@graph.html#count";