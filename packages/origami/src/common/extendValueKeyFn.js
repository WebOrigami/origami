import { ObjectGraph } from "@graphorigami/core";
import { keySymbol, toFunction } from "../common/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import Scope from "./Scope.js";
import { graphInContext } from "./utilities.js";

/**
 * Builtins like map() want to call a function that takes a value and a key.
 * They want to extend the scope passed to such a function to include the value
 * and key. This helper does that.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../..").Invocable} Invocable
 * @param {Invocable|any} valueKeyFn
 */
export default function extendValueKeyFn(valueKeyFn, options = {}) {
  const fn = toFunction(valueKeyFn);

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

    if (value && "parent" in value) {
      value = graphInContext(value, this);
    }

    const ambientsGraph = new (InheritScopeTransform(ObjectGraph))({
      ".": value,
      [keyName]: key,
      [valueName]: value,
    });
    ambientsGraph[keySymbol] = key;

    let scope = new Scope(ambientsGraph, this);

    // REVIEW: passing the key as an optional second argument creates issues
    // with FunctionGraph. For now we're just passing the value. If this sticks,
    // rename the function to extendValueFn.
    // return fn.call(scope, value, key);
    return fn.call(scope, value);
  };
}
