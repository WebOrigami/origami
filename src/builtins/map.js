import MapTypesGraph from "../common/MapTypesGraph.js";
import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import MapGraph from "../core/MapGraph.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import { AmbientPropertyGraph, setScope } from "../framework/scopeUtilities.js";

/**
 * @this {ExecutionContext}
 */
export default function map(variant, mapFn, sourceExtension, targetExtension) {
  /**
   * Extend the mapping function so that the scope attached to its execution
   * context includes additional information.
   *
   * @this {ExecutionContext}
   * @param {any} value
   * @param {any} key
   */
  async function extendedMapFn(value, key) {
    // Create a scope graph by extending the context graph with the @key and
    // @value ambient properties.
    const scope = new Scope(
      new AmbientPropertyGraph({
        "@key": key,
        "@value": value,
      }),
      this?.scope ?? this
    );

    // Convert the value to a graph.
    let valueGraph;
    if (
      typeof value !== "string" &&
      ExplorableGraph.canCastToExplorable(value)
    ) {
      valueGraph = ExplorableGraph.from(value);
      // Apply InheritScopeTransform if necessary so graph can take a scope.
      if (!("parent" in valueGraph)) {
        valueGraph = transformObject(InheritScopeTransform, valueGraph);
      }
      valueGraph.parent = scope;
    } else {
      valueGraph = null;
    }

    // Apply the scope to the value to create a context for the map function.
    // const context = setScope(value, scope);
    const context = valueGraph ?? setScope(value, scope);

    // If the mapFn is a graph, convert it to a function.
    const fn = mapFn.toFunction?.() ?? mapFn;

    // Invoke the map function with our newly-created context.
    return await fn.call(context, value, key);
  }

  return sourceExtension === undefined
    ? new MapGraph(variant, extendedMapFn)
    : new MapTypesGraph(
        variant,
        extendedMapFn,
        sourceExtension,
        targetExtension
      );
}

map.usage = `map <graph>, <mapFn>\tMap the values in a graph using a map function.`;
map.documentation = "https://explorablegraph.org/cli/builtins.html#map";
