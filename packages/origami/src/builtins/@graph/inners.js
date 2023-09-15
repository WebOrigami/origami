import { Dictionary, Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the inner nodes of the graph: the nodes with children.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} [variant]
 */
export default async function inners(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = Graph.from(variant);
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
        if (await Graph.isKeyForSubgraph(graph, key)) {
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
