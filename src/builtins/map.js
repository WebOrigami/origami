import MapTypesGraph from "../common/MapTypesGraph.js";
import MapGraph from "../core/MapGraph.js";
import {
  defineAmbientProperties,
  setScope,
} from "../framework/scopeUtilities.js";

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
    const baseScope = /** @type {any} */ (graph)?.scope ?? graph;
    const ambients = defineAmbientProperties(baseScope, {
      "@key": key,
      "@value": value,
    });

    // Apply the scope to the value to create a context for the map function.
    const context = setScope(value, ambients.scope);

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
