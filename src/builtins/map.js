import MapTypesGraph from "../common/MapTypesGraph.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import MapGraph from "../core/MapGraph.js";
import { box, transformObject } from "../core/utilities.js";
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
    // Create a scope graph by extending the context graph with the @key and
    // @value ambient properties.
    const baseScope = graph?.scope ?? graph;
    const scope = defineAmbientProperties(baseScope, {
      "@key": key,
      "@value": value,
    });

    // Convert value into a context graph or object that can take a scope.
    let context;
    if (
      typeof value !== "string" &&
      ExplorableGraph.canCastToExplorable(value)
    ) {
      // Convert the value to a graph.
      context = ExplorableGraph.from(value);
      // Apply InheritScopeTransform if necessary so graph can take a scope.
      if (!("parent" in context)) {
        context = transformObject(InheritScopeTransform, context);
      }
    } else {
      context = box(value);
    }

    // Set the context's scope to the extended scope.
    if ("parent" in context) {
      context.parent = scope;
    } else {
      context.scope = scope;
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
