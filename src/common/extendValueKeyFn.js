import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import { getScope } from "../framework/scopeUtilities.js";
import Scope from "./Scope.js";

/**
 * Builtins like map() want to call a function that takes a value and a key.
 * They want to extend the scope passed to such a function to include the value
 * and key. This helper does that.
 *
 * @param {Invocable} valueKeyFn
 */
export default function extendValueKeyFn(valueKeyFn, options = {}) {
  // Convert from an Invocable to a real function.
  /** @type {any} */
  const fn =
    typeof valueKeyFn === "function"
      ? valueKeyFn
      : typeof valueKeyFn === "object" && "toFunction" in valueKeyFn
      ? valueKeyFn.toFunction()
      : ExplorableGraph.canCastToExplorable(valueKeyFn)
      ? ExplorableGraph.toFunction(valueKeyFn)
      : valueKeyFn;

  /**
   * @this {Explorable}
   * @param {any} value
   * @param {any} key
   */
  return async function extendedValueKeyFn(value, key) {
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
