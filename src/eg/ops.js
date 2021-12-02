/// <reference path="./egcode.d.ts" />

// The graph "op" is a placeholder that represents the current graph.
export const graph = Symbol("«ops.graph»");

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

export async function quote(...args) {
  return String.prototype.concat(...args);
}
quote.toString = () => "«ops.quote»";

/**
 * Return the current value of the indicated variable (+ extension).
 *
 * @this {ProgramContext}
 * @param {string} name
 * @param {string} extension
 */
export async function variable(name, extension) {
  if (this.bindings) {
    let result = this.bindings[name];
    if (extension) {
      result += extension;
    }
    return result;
  } else {
    return undefined;
  }
}
variable.toString = () => "«ops.variable»";
