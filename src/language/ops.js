/// <reference path="./code.d.ts" />

import concatBuiltin from "../builtins/concat.js";
import execute from "./execute.js";

/**
 * Concatenate the given arguments.
 *
 * @this {Explorable}
 * @param {any[]} args
 */
export async function concat(...args) {
  return concatBuiltin.call(this, ...args);
}
concat.toString = () => "«ops.concat»";

/**
 * Return a function that will invoke the given code.
 *
 * @this {Explorable}
 * @param {Code} code
 */
export function lambda(code) {
  /** @this {Explorable} */
  return async function () {
    const result = await execute.call(this, code);
    return result;
  };
}
lambda.toString = () => "«ops.lambda»";

// The scope op is a placeholder for the graph's scope.
export const scope = "«ops.scope»";

// The `thisKey` op is a placeholder that represents the key of the object that
// resulted in the current code.
export const thisKey = "«ops.thisKey»";

// The variable op is a placeholder that represents a variable.
export const variable = "«ops.variable»";
