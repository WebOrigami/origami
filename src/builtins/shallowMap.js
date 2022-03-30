import ExplorableGraph from "../core/ExplorableGraph.js";
import * as utilities from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import { extendMapFn } from "./map.js";

/**
 * Map the top-level values of a graph with a map function.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 * @param {Invocable} mapFn
 */
export default async function shallowMap(variant, mapFn) {
  const extendedMapFn = extendMapFn(mapFn);
  const mappedGraph = new (InheritScopeTransform(ShallowMapGraph))(
    variant,
    extendedMapFn
  );
  if (this) {
    mappedGraph.parent = this;
  }
  return mappedGraph;
}

class ShallowMapGraph {
  /**
   * @param {GraphVariant} variant
   * @param {Invocable} mapFn
   */
  constructor(variant, mapFn) {
    this.graph = ExplorableGraph.from(variant);
    this.mapFn = utilities.toFunction(mapFn);
  }

  async *[Symbol.asyncIterator]() {
    yield* this.graph;
  }

  async get(key) {
    let value = await this.graph.get(key);
    return value !== undefined
      ? await this.mapFn.call(this, value, key) // Return mapped value
      : undefined;
  }
}

shallowMap.usage = `shallowMap <graph, fn>\tMap the top-level values in a graph`;
shallowMap.documentation =
  "https://explorablegraph.org/cli/builtins.html#shallowMap";
