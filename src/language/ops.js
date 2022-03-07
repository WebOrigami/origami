/// <reference path="./egcode.d.ts" />

import concatBuiltin from "../builtins/concat.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import ExplorableObject from "../core/ExplorableObject.js";
import { transformObject } from "../core/utilities.js";
import InheritScopeTransform from "../framework/InheritScopeTransform.js";
import execute from "./execute.js";

/**
 * Return a function that will invoke the given code.
 *
 * The value passed to the function will have its scope extended to include the
 * graph defining the lambda. The scope will also include two special built-in
 * values: `@value` (which returns the value passed to the function) and `@key`
 * (which returns the optional key passed to the function).
 *
 * @this {Explorable}
 * @param {Code} code
 */
export function lambda(code) {
  const parent = this;
  return async function (value, key) {
    // Add special built-in values to scope.
    const builtIns = new (InheritScopeTransform(ExplorableObject))({
      "@key": key,
      "@value": value,
    });
    builtIns.parent = parent;

    // Add the parent graph defining the lambda to the scope.
    let graph;
    if (
      typeof value !== "string" &&
      ExplorableGraph.canCastToExplorable(value)
    ) {
      graph = ExplorableGraph.from(value);
      const parent = /** @type {any} */ (graph).parent;
      if (parent === undefined) {
        if (!("parent" in graph)) {
          graph = transformObject(InheritScopeTransform, graph);
        }
        graph.parent = builtIns;
      }
    } else {
      graph = builtIns;
    }

    const result = await execute.call(graph, code);
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
  return concatBuiltin(...args);
}
concat.toString = () => "«ops.concat»";
