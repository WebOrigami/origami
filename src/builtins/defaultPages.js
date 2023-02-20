import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import DefaultPagesTransform from "../framework/DefaultPagesTransform.js";
import OriCommandTransform from "../framework/OriCommandTransform.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Add default pages to the indicated graph.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function defaultPages(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return;
  }
  const graph = ExplorableGraph.from(variant);
  const fn = (Base) => OriCommandTransform(DefaultPagesTransform(Base));
  const result = transformObject(fn, graph);
  return result;
}

defaultPages.usage = `defaultPages <graph>\tAdd default pages like index.html to the graph`;
defaultPages.documentation =
  "https://graphorigami.org/cli/builtins.html#defaultPages";
