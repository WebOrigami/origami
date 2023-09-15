import { Dictionary, Graph, ObjectGraph } from "@graphorigami/core";
import { getScope, keySymbol, transformObject } from "../common/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import Scope from "./Scope.js";

/**
 * Builtins like map() want to call a function that takes a value and a key.
 * They want to extend the scope passed to such a function to include the value
 * and key. This helper does that.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").Invocable} Invocable
 * @param {Invocable} valueKeyFn
 */
export default function extendValueKeyFn(valueKeyFn, options = {}) {
  // Convert from an Invocable to a real function.
  /** @type {any} */
  const fn =
    typeof valueKeyFn === "function"
      ? valueKeyFn
      : valueKeyFn &&
        typeof valueKeyFn === "object" &&
        "toFunction" in valueKeyFn
      ? valueKeyFn.toFunction()
      : Graph.isGraphable(valueKeyFn)
      ? Graph.toFunction(valueKeyFn)
      : valueKeyFn;

  /**
   * @this {AsyncDictionary|null}
   * @param {any} value
   * @param {any} key
   */
  return async function extendedValueKeyFn(value, key) {
    if (typeof fn !== "function") {
      // Constant value, return as is.
      return fn;
    }

    // Create a scope graph by extending the context graph with the @key and
    // @dot ambient properties.
    const keyName = options.keyName ?? "@key";
    const valueName = options.valueName ?? "@value";

    // See if the value is a graph or can be cast to a graph.
    let valueGraph;
    if (Dictionary.isAsyncDictionary(value)) {
      valueGraph = value;
    } else if (Graph.isGraphable(value)) {
      valueGraph = Graph.from(value);
    }
    if (valueGraph && !("parent" in valueGraph && "scope" in valueGraph)) {
      valueGraph = transformObject(InheritScopeTransform, valueGraph);
    }

    const ambientsGraph = new (InheritScopeTransform(ObjectGraph))({
      ".": valueGraph ?? null,
      [keyName]: key,
      [valueName]: value ?? null,
    });
    ambientsGraph[keySymbol] = key;

    let scope = new Scope(valueGraph, ambientsGraph, getScope(this));

    if (valueGraph) {
      valueGraph.parent = scope;
      // REVIEW: If this option doesn't prove valuable, remove it
      if (options.addValueToScope) {
        scope = valueGraph.scope;
      }
    }

    // REVIEW: passing the key as an optional second argument creates issues
    // with FunctionGraph. For now we're just passing the value. If this sticks,
    // rename the function to extendValueFn.
    // return fn.call(scope, value, key);
    return fn.call(scope, value);
  };
}
