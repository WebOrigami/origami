import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { parse } from "../core/utilities.js";
import { parentScope } from "../framework/scopeUtilities.js";

/**
 * Wrap a graph and redefine the key used to access nodes in it.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 * @param {string} [indexKey]
 */
export default async function mapKeys(variant, indexKey) {
  const graph = ExplorableGraph.from(variant);
  const baseScope = parentScope(this);
  return {
    async *[Symbol.asyncIterator]() {
      for await (const key of graph[Symbol.asyncIterator]()) {
        const value = await graph.get(key);
        const data = value ? await dataFromInput(value) : undefined;
        if (data !== undefined) {
          const mappedKey = indexKey === undefined ? data : data[indexKey];
          yield mappedKey;
        }
      }
    },

    async get(key) {
      for await (const graphKey of graph[Symbol.asyncIterator]()) {
        const value = await graph.get(graphKey);
        const data = value ? await dataFromInput(value) : undefined;
        if (data !== undefined) {
          const index = indexKey === undefined ? data : data[indexKey];
          if (index === key) {
            return data;
          }
        }
      }
      return undefined;
    },

    get scope() {
      return new Scope(this, baseScope);
    },
  };
}

async function dataFromInput(input) {
  let parsed = input;
  if (typeof input === "string" || input instanceof Buffer) {
    parsed = await parse(String(input));
    if (typeof parsed === "string") {
      return parsed;
    }
  }
  const data = ExplorableGraph.isExplorable(parsed)
    ? await ExplorableGraph.plain(parsed)
    : parsed;
  return data;
}

mapKeys.usage = `mapKeys <graph>\tDefine the key used to get nodes from the graph`;
mapKeys.documentation = "https://explorablegraph.org/cli/builtins.html#mapKeys";
