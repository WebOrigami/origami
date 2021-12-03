/// <reference path="./egcode.d.ts" />

// The graph op is a placeholder that represents the current graph.
export const graph = Symbol("«ops.graph»");

// The `thisKey` op is a placeholder that represents the key of the object that
// resulted in the current code.
export const thisKey = Symbol("«ops.thisKey»");

// The variable op is a placeholder that represents a variable.
export const variable = Symbol("«ops.variable»");

/**
 * Get the key from the current graph and, if it's a function, invoke it.
 *
 * @this {ProgramContext}
 * @param {any} key
 */
export async function implicitCall(key) {
  let value = await this.graph.get(key);
  if (typeof value === "function") {
    value = await value.call(this);
  }
  return value;
}

export async function concat(...args) {
  return String.prototype.concat(...args);
}
concat.toString = () => "«ops.concat";
