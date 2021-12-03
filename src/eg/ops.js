/// <reference path="./egcode.d.ts" />

// The graph op is a placeholder that represents the current graph.
export const graph = Symbol("«ops.graph»");

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

/**
 * Return the string key for the formula that created this code.
 *
 * @this {ProgramContext}
 */
export async function thisKey() {
  return this.thisKey;
}
thisKey.toString = () => "«ops.thisKey»";

export async function concat(...args) {
  return String.prototype.concat(...args);
}
concat.toString = () => "«ops.concat";
