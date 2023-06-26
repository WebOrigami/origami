/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import ExplorableGraph from "../../core/ExplorableGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Cast the indicated variant to a graph.
 *
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} [variant]
 */
export default async function graph(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  return ExplorableGraph.from(variant);
}

graph.usage = `graph <variant>\tConvert JSON, YAML, function, or plain object to a graph`;
graph.documentation = "https://graphorigami.org/cli/builtins.html#graph";
