/// <reference path="./code.d.ts" />

import concatBuiltin from "../builtins/concat.js";
import OrigamiGraph from "../framework/OrigamiGraph.js";
import execute from "./execute.js";

// The assign op is a placeholder for an assignment declaration.
// It is only used during parsing -- it shouldn't be executed.
export const assign = "«ops.assign»";

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
 * Construct an graph. This is similar to ops.object but the result is an
 * OrigamiGraph instance.
 *
 * @this {Explorable}
 * @param {PlainObject} obj
 */
export async function graph(obj) {
  return new OrigamiGraph(obj);
}
graph.toString = () => "«ops.graph»";

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

/**
 * Construct an object. The keys will be the same as the given `obj`
 * parameter's, and the values will be the results of evaluating the
 * corresponding code values in `obj`.
 *
 * @this {Explorable}
 * @param {PlainObject} obj
 */
export async function object(obj) {
  const result = {};
  for (const key in obj) {
    const code = obj[key];
    result[key] = await execute.call(this, code);
  }
  return result;
}
object.toString = () => "«ops.object»";

// The scope op is a placeholder for the graph's scope.
export const scope = "«ops.scope»";

// The `thisKey` op is a placeholder that represents the key of the object that
// resulted in the current code.
export const thisKey = "«ops.thisKey»";
