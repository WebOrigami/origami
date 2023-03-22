import ExplorableGraph from "../../core/ExplorableGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the inner nodes of the graph: the nodes with children.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function inners(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  const inner = {
    async get(key) {
      const value = await graph.get(key);
      return ExplorableGraph.isExplorable(value) ? inners(value) : undefined;
    },

    async keys() {
      const explorableKeys = [];
      for (const key of await graph.keys()) {
        if (await ExplorableGraph.isKeyExplorable(graph, key)) {
          explorableKeys.push(key);
        }
      }
      return explorableKeys;
    },
  };
  return inner;
}

inners.usage = `inners <graph>\tThe inner nodes of the graph`;
inners.documentation = "https://graphorigami.org/cli/builtins.html#inners";
