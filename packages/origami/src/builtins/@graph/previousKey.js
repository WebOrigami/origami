import ExplorableGraph from "../../core/ExplorableGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Returns the key before the indicated key.
 *
 * @param {GraphVariant} variant
 * @param {any} key
 * @this {Explorable|null}
 */
export default async function previousKey(variant, key) {
  assertScopeIsDefined(this);
  const graph = ExplorableGraph.from(variant);
  let previousKey = undefined;
  for (const graphKey of await graph.keys()) {
    if (graphKey === key) {
      return previousKey;
    }
    previousKey = graphKey;
  }
  return undefined;
}

previousKey.usage = `previousKey <graph>, <key>\tReturns the key before the indicated key`;
previousKey.documentation =
  "https://graphorigami.org/cli/builtins.html#previousKey";
