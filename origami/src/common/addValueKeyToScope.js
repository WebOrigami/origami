import { ObjectTree } from "@weborigami/async-tree";
import { Scope } from "@weborigami/language";

/**
 * A number of transforms accept functions that can accept a single value. This
 * helper adds the value and key to the scope as ambients.
 *
 *
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.js").Invocable} Invocable
 *
 * @param {AsyncTree|null} scope
 * @param {any} value
 * @param {any} key
 */
export default function addValueKeyToScope(scope, value, key) {
  // Add the key and value to the scope as ambients.
  const ambients = new ObjectTree({
    "@key": key,
    _: value,
  });
  return new Scope(ambients, scope);
}
