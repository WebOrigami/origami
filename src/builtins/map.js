import MapTypesGraph from "../common/MapTypesGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import ExplorableObject from "../core/ExplorableObject.js";
import MapGraph from "../core/MapGraph.js";
import { transformObject } from "../core/utilities.js";
import defineAmbientProperties from "../framework/defineAmbientProperties.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";

/**
 * @this {Explorable}
 */
export default function map(variant, mapFn, sourceExtension, targetExtension) {
  // The function context for `map` (if defined) will become the basis for the
  // graph that will be the context for the mapping function.
  const graph = this;

  // We extend the mapping function so that the function's `this` context's
  // scope includes additional information.
  async function extendedMapFn(value, key) {
    // Establish the @key and @value ambient properties.
    const ambientProperties = {
      "@key": key,
      "@value": value,
    };

    // If the outer `map` function was invoked in the context of a graph, extend
    // that graph with the ambient properties. Otherwise, the ambient properties
    // themselves will be the basis for the graph.
    const withAmbients = graph
      ? defineAmbientProperties(graph, ambientProperties)
      : new (InheritScopeTransform(ExplorableObject))(ambientProperties);

    // If the value is explorable (but not a string), extend the graph with it.
    let withValue;
    if (
      typeof value !== "string" &&
      ExplorableGraph.canCastToExplorable(value)
    ) {
      withValue = ExplorableGraph.from(value);
      const parent = /** @type {any} */ (withValue).parent;
      if (parent === undefined) {
        if (!("parent" in withValue)) {
          withValue = transformObject(InheritScopeTransform, withValue);
        }
        withValue.parent = withAmbients;
      }
    } else {
      withValue = withAmbients;
    }

    return await mapFn.call(withValue, value, key);
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
