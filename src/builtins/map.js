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
export default function map(variant, mapFn, options = {}) {
  if (!variant) {
    return undefined;
  }

  const extendedMapFn = extendMapFn(mapFn, options);

  /** @type {any} */
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
 * @param {Invocable} mapFn
 */
function extendMapFn(mapFn, options) {
  // Convert the mapFn from an Invocable to a real function.
  /** @type {any} */
  const fn =
    typeof mapFn === "function"
      ? mapFn
      : typeof mapFn === "object" && "toFunction" in mapFn
      ? mapFn.toFunction()
      : ExplorableGraph.canCastToExplorable(mapFn)
      ? ExplorableGraph.toFunction(mapFn)
      : mapFn;

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

    let extendedValue;
    if (
      !ExplorableGraph.isExplorable(value) &&
      ExplorableGraph.canCastToExplorable(value)
    ) {
      try {
        extendedValue = ExplorableGraph.from(value);
      } catch (error) {
        // Couldn't create a graph; probably text that's not a graph.
      }
    }
    if (!extendedValue) {
      extendedValue = typeof value === "object" ? Object.create(value) : value;
    }
    if (
      typeof extendedValue === "object" &&
      !("parent" in extendedValue && "scope" in extendedValue)
    ) {
      extendedValue = transformObject(InheritScopeTransform, extendedValue);
    }

    let scope = new Scope(
      {
        ".": extendedValue ?? null,
        [keyName]: key,
        [valueName]: extendedValue ?? null,
      },
      getScope(this)
    );

    if (typeof extendedValue === "object") {
      extendedValue.parent = scope;
      if (options.addValueToScope) {
        scope = extendedValue.scope;
      }
    }

    return fn.call(scope, value, key);
  };
}

map.usage = `map <graph, fn>\tMap the top-level values in a graph`;
map.documentation = "https://graphorigami.org/cli/builtins.html#map";
