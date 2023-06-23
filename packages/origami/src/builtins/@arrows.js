import { keySymbol } from "../core/utilities.js";
import ArrowGraph from "../framework/ArrowGraph.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Interpret arrow keys in the graph as function calls.
 *
 * @this {Explorable|null}
 * @param {GraphVariant} [variant]
 */
export default async function arrows(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = new ArrowGraph(variant, { deep: true });
  graph[keySymbol] = "@arrows";
  graph.parent = this;
  return graph;
}

arrows.usage = `@arrows <obj>\tInterpret arrow keys in the graph as function calls`;
arrows.documentation = "https://graphorigami.org/language/@arrows.html";
