/// <reference path="./code.d.ts" />

import concatBuiltin from "../builtins/concat.js";
import defineAmbientProperties from "../core/defineAmbientProperties.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
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
  return async function (value, key) {
    // Add special built-in values as ambient properties.
    const withAmbients = defineAmbientProperties(this, {
      "@key": key,
      "@value": value,
    });

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
        graph.parent = withAmbients;
      }
    } else {
      graph = withAmbients;
    }

    const result = await execute.call(graph, code);
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
