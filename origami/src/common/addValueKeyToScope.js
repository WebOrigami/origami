import Scope from "./Scope.js";

/**
 * A number of transforms accept functions that can accept a single value. This
 * helper adds the value and key to the scope as ambients.
 *
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("../../index.js").Invocable} Invocable
 *
 * @param {AsyncDictionary|null} scope
 * @param {any} value
 * @param {any} key
 * @param {string} [valueName]
 * @param {string} [keyName]
 */
export default function addValueKeyToScope(
  scope,
  value,
  key,
  valueName = "_",
  keyName = "@key"
) {
  // Add the key and value to the scope as ambients.
  const ambients = {
    [keyName]: key,
    [valueName]: value,
  };
  const extendedScope = new Scope(ambients, scope);
  // return valueFn.bind(extendedScope);
  return extendedScope;
}
