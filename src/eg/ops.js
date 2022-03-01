/// <reference path="./egcode.d.ts" />

import InheritScopeTransform from "../app/InheritScopeTransform.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";
import execute from "./execute.js";

export function lambda(code) {
  const parent = this;
  return async function (value, key) {
    // Make value's parent the graph that invoked the lambda.
    // REVIEW: Not sure if value scope should be extended here or in
    // MapGraph/shallowMap
    let graph = ExplorableGraph.from(value);
    if (graph.parent === undefined) {
      if (!("parent" in graph)) {
        graph = transformObject(InheritScopeTransform, graph);
      }
      graph.parent = parent;
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
  const textPromises = args.map(async (arg) =>
    ExplorableGraph.isExplorable(arg)
      ? concat(...(await ExplorableGraph.values(arg)))
      : arg
      ? arg.toString()
      : "undefined"
  );
  const text = await Promise.all(textPromises);
  return text.join("");
}
concat.toString = () => "«ops.concat»";
