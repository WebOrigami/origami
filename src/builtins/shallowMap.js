import Scope from "../common/Scope.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import * as utilities from "../core/utilities.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import { getScope } from "../framework/scopeUtilities.js";

/**
 * Map the top-level values of a graph with a map function.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 * @param {Invocable} mapFn
 */
export default function shallowMap(variant, mapFn) {
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

/**
 * Extend the mapping function so that the scope attached to its execution
 * context includes additional information.
 *
 * @param {Invocable} mapFn
 */
function extendMapFn(mapFn) {
  /**
   * @this {Explorable}
   * @param {any} value
   * @param {any} key
   */
  return async function extendedMapFn(value, key) {
    // Create a scope graph by extending the context graph with the @key and
    // @value ambient properties.
    let scope = new Scope(
      {
        "@key": key,
        "@value": value,
      },
      getScope(this)
    );

    // Convert the value to a graph if possible.
    if (
      typeof value !== "string" &&
      ExplorableGraph.canCastToExplorable(value)
    ) {
      /** @type {any} */
      let valueGraph = ExplorableGraph.from(value);
      if (!("parent" in valueGraph)) {
        valueGraph = transformObject(InheritScopeTransform, valueGraph);
      }
      valueGraph.parent = scope;
      scope = valueGraph.scope;
    }

    // Convert the mapFn from an Invocable to a real function.
    /** @type {any} */
    const fn =
      "toFunction" in mapFn
        ? mapFn.toFunction()
        : ExplorableGraph.isExplorable(mapFn)
        ? ExplorableGraph.toFunction(mapFn)
        : mapFn;

    // Invoke the map function with our newly-created context.
    return fn.call(scope, value, key);
  };
}

shallowMap.usage = `shallowMap <graph, fn>\tMap the top-level values in a graph`;
shallowMap.documentation =
  "https://explorablegraph.org/cli/builtins.html#shallowMap";
