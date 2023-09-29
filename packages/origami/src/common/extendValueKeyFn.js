import { Graph, ObjectGraph } from "@graphorigami/core";
import { keySymbol, toFunction } from "../common/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import Scope from "./Scope.js";
import { graphInContext } from "./utilities.js";

/**
 * A number of transforms accept functions that can accept a single value.
 * This helper turns such a function into a function that accepts both a value
 * and a key.
 *
 * Moreover, the scope passed to the new function will include ambient
 * properties `@key` and `@value` holding the key and value, respectively.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").Invocable} Invocable
 * @param {Invocable|any} valueFn
 */
export default function extendValueKeyFn(valueFn, options = {}) {
  const fn = toFunction(valueFn);

  /**
   * @this {AsyncDictionary|null}
   * @param {any} value
   * @param {any} key
   */
  return async function extendedValueKeyFn(value, key) {
    // Create a scope graph by extending the context graph with the @key and
    // @dot ambient properties.
    const keyName = options.keyName ?? "@key";
    const valueName = options.valueName ?? "@value";

    if (Graph.isGraphable(value)) {
      value = graphInContext(value, this);
    }

    const ambientsGraph = new (InheritScopeTransform(ObjectGraph))({
      ".": value,
      [keyName]: key,
      [valueName]: value,
    });
    ambientsGraph[keySymbol] = key;

    let scope = new Scope(
      ambientsGraph,
      Graph.isAsyncDictionary(value) ? value : null,
      this
    );

    return fn.call(scope, value);
  };
}
