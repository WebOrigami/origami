import { Dictionary, Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the inner nodes of the graph: the nodes with children.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} [graphable]
 */
export default async function inners(graphable) {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return undefined;
  }
  const graph = Graph.from(graphable);
  const inner = {
    async get(key) {
      const value = await graph.get(key);
      return Dictionary.isAsyncDictionary(value)
        ? inners.call(this, value)
        : undefined;
    },

    async keys() {
      const subgraphKeys = [];
      for (const key of await graph.keys()) {
        if (await Graph.isKeyForSubtree(graph, key)) {
          subgraphKeys.push(key);
        }
      }
      return subgraphKeys;
    },
  };
  return inner;
}

inners.usage = `inners <graph>\tThe inner nodes of the graph`;
inners.documentation = "https://graphorigami.org/cli/builtins.html#inners";
