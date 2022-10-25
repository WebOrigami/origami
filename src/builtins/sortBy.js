import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import { getScope } from "../framework/scopeUtilities.js";

/**
 * Return a new graph with the original's keys sorted using the given function.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 * @param {Invocable} sortKeyFn
 */
export default async function sortBy(variant, sortKeyFn) {
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  const result = Object.create(graph);
  const extendedSortFn = extendFn(sortKeyFn);

  result[Symbol.asyncIterator] = async function* () {
    const sorted = [];
    for await (const key of graph[Symbol.asyncIterator]()) {
      const value = await graph.get(key);
      const sortKey = await extendedSortFn.call(this, value, key);
      sorted.push({ key, sortKey });
    }
    sorted.sort((a, b) => {
      if (a.sortKey < b.sortKey) {
        return -1;
      }
      if (a.sortKey > b.sortKey) {
        return 1;
      }
      return 0;
    });
    const keys = sorted.map(({ key }) => key);
    yield* keys;
  };

  return result;
}

/**
 * Extend the function so that the scope attached to its execution context
 * includes additional information.
 *
 * @param {Invocable} fn
 */
function extendFn(fn) {
  // Convert the mapFn from an Invocable to a real function.
  /** @type {any} */
  const realFn =
    typeof fn === "function"
      ? fn
      : typeof fn === "object" && "toFunction" in fn
      ? fn.toFunction()
      : ExplorableGraph.canCastToExplorable(fn)
      ? ExplorableGraph.toFunction(fn)
      : fn;

  /**
   * @this {Explorable}
   * @param {any} value
   * @param {any} key
   */
  return async function extendedFn(value, key) {
    // Create a scope graph by extending the context graph with the @key and
    // @value ambient properties.
    let scope = new Scope(
      {
        ".": value ?? null,
        "@key": key,
        "@value": value ?? null,
      },
      getScope(this)
    );

    // Convert the value to a graph if possible.
    let extendedValue;
    if (
      typeof value !== "string" &&
      ExplorableGraph.canCastToExplorable(value)
    ) {
      extendedValue = ExplorableGraph.from(value);
      if (!("parent" in extendedValue && "scope" in extendedValue)) {
        extendedValue = transformObject(InheritScopeTransform, extendedValue);
      }
      extendedValue.parent = scope;
      scope = extendedValue.scope;
    } else {
      extendedValue = value;
    }

    // Invoke the map function with our newly-created context.
    return realFn.call(scope, extendedValue, key);
  };
}

sortBy.usage = `sortBy graph, fn\tReturn a new graph sorting keys by the function`;
sortBy.documentation = "https://graphorigami.org/cli/builtins.html#sortBy";
