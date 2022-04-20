import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { parse, transformObject } from "../core/utilities.js";
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
  const graph = ExplorableGraph.from(variant);
  const extendedKeyFn = keyFn ? extendKeyFn(keyFn) : null;
  const scope = getScope(this);
  return {
    async *[Symbol.asyncIterator]() {
      for await (const key of graph[Symbol.asyncIterator]()) {
        const value = await graph.get(key);
        const data = value ? await dataFromInput(value) : undefined;
        if (data !== undefined) {
          const mappedKey =
            extendedKeyFn === null
              ? data
              : await extendedKeyFn.call(scope, data, key);
          yield mappedKey;
        }
      }
    },

    async get(key) {
      for await (const graphKey of graph[Symbol.asyncIterator]()) {
        const value = await graph.get(graphKey);
        const data = value ? await dataFromInput(value) : undefined;
        if (data !== undefined) {
          const index =
            extendedKeyFn === null
              ? data
              : await extendedKeyFn.call(scope, data, key);
          if (index === key) {
            return data;
          }
        }
      }
      return undefined;
    },

    get scope() {
      return scope;
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
