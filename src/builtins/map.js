import MapTypesGraph from "../common/MapTypesGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import ExplorableObject from "../core/ExplorableObject.js";
import MapGraph from "../core/MapGraph.js";
import { box } from "../core/utilities.js";
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
    // Convert value into an execution context with a scope.
    let context;
    if (
      typeof value !== "string" &&
      ExplorableGraph.canCastToExplorable(value)
    ) {
      context = ExplorableGraph.from(value);
    } else {
      context = box(value);
    }

    // Establish the @key and @value ambient properties.
    const ambientProperties = {
      "@key": key,
      "@value": value,
    };
    let ambients;
    if (graph) {
      ambients = new (InheritScopeTransform(ExplorableObject))(
        ambientProperties
      );
      ambients.parent = graph;
    } else {
      ambients = new ExplorableObject(ambientProperties);
    }

    if ("parent" in context) {
      context.parent = ambients;
    } else {
      context.scope = ambients;
    }

    const fn = mapFn.toFunction?.() ?? mapFn;
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
