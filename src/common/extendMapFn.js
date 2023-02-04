import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import { getScope } from "../framework/scopeUtilities.js";
import Scope from "./Scope.js";

/**
 * Extend the mapping function so that the scope attached to its execution
 * context includes additional information.
 *
 * @param {Invocable} mapFn
 */
export default function extendMapFn(mapFn, options = {}) {
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

    let valueAsGraph;
    if (
      !ExplorableGraph.isExplorable(value) &&
      ExplorableGraph.canCastToExplorable(value)
    ) {
      try {
        valueAsGraph = ExplorableGraph.from(value);
      } catch (error) {
        // Couldn't create a graph; probably text that's not a graph.
      }
    }
    if (!valueAsGraph) {
      valueAsGraph = typeof value === "object" ? Object.create(value) : value;
    }
    if (
      typeof valueAsGraph === "object" &&
      !("parent" in valueAsGraph && "scope" in valueAsGraph)
    ) {
      valueAsGraph = transformObject(InheritScopeTransform, valueAsGraph);
    }

    let scope = new Scope(
      {
        ".": valueAsGraph ?? null,
        [keyName]: key,
        [valueName]: value ?? null,
      },
      getScope(this)
    );

    if (typeof valueAsGraph === "object") {
      valueAsGraph.parent = scope;
      if (options.addValueToScope) {
        scope = valueAsGraph.scope;
      }
    }

    return fn.call(scope, value, key);
  };
}
