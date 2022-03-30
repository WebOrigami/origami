import MapTypesGraph from "../common/MapTypesGraph.js";
import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import MapGraph from "../core/MapGraph.js";
import { transformObject } from "../core/utilities.js";
import AmbientPropertiesGraph from "../framework/AmbientPropertiesGraph.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import { getScope } from "../framework/scopeUtilities.js";

/**
 * @this {Explorable}
 */
export default function map(variant, mapFn, sourceExtension, targetExtension) {
  const extendedMapFn = extendMapFn(mapFn);
  const mappedGraph =
    sourceExtension === undefined
      ? new (InheritScopeTransform(MapGraph))(variant, extendedMapFn)
      : new (InheritScopeTransform(MapTypesGraph))(
          variant,
          extendedMapFn,
          sourceExtension,
          targetExtension
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
export function extendMapFn(mapFn) {
  /**
   * @this {MapGraph|MapTypesGraph}
   * @param {any} value
   * @param {any} key
   */
  return async function extendedMapFn(value, key) {
    // When this is called, `this` will be an instance of MapGraph or
    // MapTypesGraph.

    // Create a scope graph by extending the context graph with the @key and
    // @value ambient properties.
    let scope = new Scope(
      new AmbientPropertiesGraph({
        "@key": key,
        "@value": value,
      }),
      getScope(this)
    );

    // Convert the value to a graph if possible.
    if (
      typeof value !== "string" &&
      ExplorableGraph.canCastToExplorable(value)
    ) {
      let valueGraph = ExplorableGraph.from(value);
      if (!("parent" in valueGraph)) {
        valueGraph = transformObject(InheritScopeTransform, valueGraph);
      }
      valueGraph.parent = scope;
      scope = valueGraph.scope;
    }

    // If the mapFn is a graph, convert it to a function.
    const fn = mapFn.toFunction?.() ?? mapFn;

    // Invoke the map function with our newly-created context.
    return await fn.call(scope, value, key);
  };
}

map.usage = `map <graph>, <mapFn>\tMap the values in a graph using a map function.`;
map.documentation = "https://explorablegraph.org/cli/builtins.html#map";
