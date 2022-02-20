/// <reference path="./egcode.d.ts" />

import ExplorableGraph from "../core/ExplorableGraph.js";
import execute from "./execute.js";

export function lambda(code) {
  return async function (value, key) {
    const result = await execute.call(value, code);
    return result;
  };
}
lambda.toString = () => "«ops.lambda";

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
  const scope = this.scope ?? this;
  let value = await scope.get(key);
  if (typeof value === "function") {
    value = await value.call(this);
  }
  return value;
}

export async function concat(...args) {
  const textPromises = args.map(async (arg) =>
    ExplorableGraph.isExplorable(arg)
      ? concat(...(await ExplorableGraph.values(arg)))
      : arg.toString()
  );
  const text = await Promise.all(textPromises);
  return text.join("");
}
concat.toString = () => "«ops.concat»";
