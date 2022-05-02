import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
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
  const extendedKeyFn = keyFn ? extendKeyFn(keyFn) : null;
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
  };
}

/**
 * Extend the key function so that the scope attached to its execution context
 * includes additional information.
 *
 * @param {Invocable} keyFn
 */
export function extendKeyFn(keyFn) {
  /**
   * @this {Explorable}
   * @param {any} value
   * @param {any} key
   */
  return async function extendedKeyFn(value, key) {
    // Create a scope graph by extending the context graph with the @key and
    // @value ambient properties.
    let scope = new Scope(
      {
        "@key": key,
        "@value": value,
      },
      getScope(this)
    );

    // Convert the value to a graph if possible.
    if (
      typeof value !== "string" &&
      ExplorableGraph.canCastToExplorable(value)
    ) {
      /** @type {any} */
      let valueGraph = ExplorableGraph.from(value);
      if (!("parent" in valueGraph)) {
        valueGraph = transformObject(InheritScopeTransform, valueGraph);
      }
      valueGraph.parent = scope;
      scope = valueGraph.scope;
    }

    // Convert the keyFn from an Invocable to a real function.
    /** @type {any} */
    const fn =
      "toFunction" in keyFn
        ? keyFn.toFunction()
        : ExplorableGraph.isExplorable(keyFn)
        ? ExplorableGraph.toFunction(keyFn)
        : keyFn;

    // Invoke the map function with our newly-created context.
    return fn.call(scope, value, key);
  };
}

mapKeys.usage = `mapKeys <graph>\tDefine the key used to get nodes from the graph`;
mapKeys.documentation = "https://explorablegraph.org/cli/builtins.html#mapKeys";
