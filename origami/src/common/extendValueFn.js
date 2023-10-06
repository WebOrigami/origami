import Scope from "./Scope.js";
import { toFunction } from "./utilities.js";

/**
 * A number of transforms accept functions that can accept a single value.
 * This helper turns such a function into a function that accepts both a value
 * and a key.
 *
 * Moreover, the scope passed to the new function will include ambient
 * properties `@key` and `_` holding the key and value, respectively.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../../index.js").Invocable} Invocable
 * @param {Invocable|any} valueFn
 */
export default function extendValueFn(valueFn, options = {}) {
  const fn = toFunction(valueFn);

  /**
   * @this {AsyncDictionary|null}
   * @param {any} value
   * @param {any} key
   */
  return async function extendedValueFn(value, key) {
    const keyName = options.keyName ?? "@key";
    const valueName = options.valueName ?? "_";
    const ambients = {
      [keyName]: key,
      [valueName]: value,
    };
    const scope = new Scope(ambients, this);
    return fn.call(scope, value);
  };
}
