import extendValueKeyFn from "../common/extendValueKeyFn.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { getScope } from "../framework/scopeUtilities.js";

/**
 * Wrap a graph and redefine the key used to access nodes in it.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 * @param {function} [keyFn]
 */
export default async function mapKeys(variant, keyFn) {
  if (!variant) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  const extendedKeyFn = keyFn ? extendValueKeyFn(keyFn) : null;
  const scope = getScope(this);
  return {
    async *[Symbol.asyncIterator]() {
      for await (const key of graph[Symbol.asyncIterator]()) {
        const value = await graph.get(key);
        const mappedKey =
          value !== undefined && extendedKeyFn
            ? await extendedKeyFn.call(scope, value, key)
            : value;
        yield mappedKey;
      }
    },

    async get(key) {
      for await (const graphKey of graph[Symbol.asyncIterator]()) {
        const value = await graph.get(graphKey);
        const mappedKey =
          value !== undefined && extendedKeyFn
            ? await extendedKeyFn.call(scope, value, key)
            : value;
        if (mappedKey === key) {
          return value;
        }
      }
      return undefined;
    },

    get scope() {
      return scope;
    },

    async unwatch() {
      return /** @type {any} */ (this.graph).unwatch?.();
    },
    async watch() {
      await /** @type {any} */ (this.graph).watch?.();
    },
  };
}

mapKeys.usage = `mapKeys <graph>\tDefine the key used to get nodes from the graph`;
mapKeys.documentation = "https://graphorigami.org/cli/builtins.html#mapKeys";
