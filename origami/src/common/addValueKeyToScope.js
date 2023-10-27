import { Scope } from "@graphorigami/language";

/**
 * A number of transforms accept functions that can accept a single value. This
 * helper adds the value and key to the scope as ambients.
 *
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.js").Invocable} Invocable
 *
 * @param {AsyncTree|null} scope
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
  return new Scope(ambients, scope);
}
