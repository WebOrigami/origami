/// <reference path="./egcode.d.ts" />

// The scope op is a placeholder for the graph's scope.
export const scope = Symbol("«ops.scope»");

// The `thisKey` op is a placeholder that represents the key of the object that
// resulted in the current code.
export const thisKey = Symbol("«ops.thisKey»");

// The variable op is a placeholder that represents a variable.
export const variable = Symbol("«ops.variable»");

/**
 * Get the key from the current graph and, if it's a function, invoke it.
 *
 * @this {Explorable}
 * @param {any} key
 */
export async function implicitCall(key) {
  let value = await this.get(key);
  if (typeof value === "function") {
    value = await value.call(this);
  }
  return value;
}

export async function concat(...args) {
  return String.prototype.concat(...args);
}
concat.toString = () => "«ops.concat»";
