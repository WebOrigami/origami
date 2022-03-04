import MapTypesGraph from "../common/MapTypesGraph.js";
import MapGraph from "../core/MapGraph.js";

/**
 * @this {Explorable}
 */
export default function map(variant, mapFn, sourceExtension, targetExtension) {
  return sourceExtension === undefined
    ? new MapGraph(variant, mapFn)
    : new MapTypesGraph(variant, mapFn, sourceExtension, targetExtension);
}

map.usage = `map <graph>, <mapFn>\tMap the values in a graph using a map function.`;
map.documentation = "https://explorablegraph.org/pika/builtins.html#map";
