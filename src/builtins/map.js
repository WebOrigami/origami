import MapExtensionsGraph from "../common/MapExtensionsGraph.js";
import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import MapValuesGraph from "../core/MapValuesGraph.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import { getScope } from "../framework/scopeUtilities.js";

/**
 * Map the top-level values of a graph with a map function.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 * @param {Invocable} mapFn
 * @param {PlainObject} options
 */
export default async function map(variant, mapFn, options = {}) {
  if (!variant) {
    return undefined;
  }

  // Convert the mapFn from an Invocable to a real function.
  /** @type {any} */
  const fn =
    typeof mapFn === "function"
      ? mapFn
      : typeof mapFn === "object" && "toFunction" in mapFn
      ? mapFn.toFunction()
      : ExplorableGraph.canCastToExplorable(mapFn)
      ? ExplorableGraph.toFunction(mapFn)
      : null;
  if (!fn) {
    throw new TypeError("map(): the supplied map function is not valid.");
  }

  const extendedMapFn = extendMapFn(fn, options);

  const GraphClass =
    options.extension === undefined ? MapValuesGraph : MapExtensionsGraph;
  const mappedGraph = new (InheritScopeTransform(GraphClass))(
    variant,
    extendedMapFn,
    options
  );
  if (this) {
    mappedGraph.parent = this;
  }
  return mappedGraph;
}

/**
 * Extend the mapping function so that the scope attached to its execution
 * context includes additional information.
 *
 * @param {function} fn
 */
function extendMapFn(fn, options) {
  /**
   * @this {Explorable}
   * @param {any} value
   * @param {any} key
   */
  return async function extendedMapFn(value, key) {
    // Create a scope graph by extending the context graph with the @key and
    // @dot ambient properties.
    const keyName = options.keyName ?? "@key";
    const valueName = options.valueName ?? "@value";
    let scope = new Scope(
      {
        ".": value ?? null,
        [keyName]: key,
        [valueName]: value ?? null,
      },
      getScope(this)
    );

    // Convert the value to a graph if possible.
    let extendedValue;
    if (ExplorableGraph.canCastToExplorable(value)) {
      try {
        extendedValue = ExplorableGraph.from(value);
      } catch (error) {
        // Couldn't create a graph; probably text that's not a graph.
      }
    }
    if (extendedValue) {
      if (!("parent" in extendedValue && "scope" in extendedValue)) {
        extendedValue = transformObject(InheritScopeTransform, extendedValue);
      }
      extendedValue.parent = scope;
      scope = extendedValue.scope;
    } else {
      extendedValue = value;
    }

    // Invoke the map function with our newly-created context.
    return fn.call(scope, extendedValue, key);
  };
}

map.usage = `map <graph, fn>\tMap the top-level values in a graph`;
map.documentation = "https://graphorigami.org/cli/builtins.html#map";
