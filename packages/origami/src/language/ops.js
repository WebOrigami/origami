/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 */

import { Graph } from "@graphorigami/core";
import filesBuiltin from "../builtins/@files.js";
import concatBuiltin from "../builtins/@graph/concat.js";
import graphHttpBuiltin from "../builtins/@graphHttp.js";
import graphHttpsBuiltin from "../builtins/@graphHttps.js";
import httpBuiltin from "../builtins/@http.js";
import httpsBuiltin from "../builtins/@https.js";
import Scope from "../common/Scope.js";
import execute from "./execute.js";
import { createExpressionFunction } from "./expressionFunction.js";

let OrigamiGraph;

/**
 * Construct an array.
 *
 * @this {AsyncDictionary|null}
 * @param {any[]} items
 */
export async function array(...items) {
  return Array(...items);
}
array.toString = () => "«ops.array»";

// The assign op is a placeholder for an assignment declaration.
// It is only used during parsing -- it shouldn't be executed.
export const assign = "«ops.assign»";

/**
 * Concatenate the given arguments.
 *
 * @this {AsyncDictionary|null}
 * @param {any[]} args
 */
export async function concat(...args) {
  return concatBuiltin.call(this, ...args);
}
concat.toString = () => "«ops.concat»";

/**
 * Construct a files graph for the filesystem root.
 *
 * @this {AsyncDictionary|null}
 */
export function filesRoot() {
  return filesBuiltin.call(this, "/");
}

/**
 * Construct an graph. This is similar to ops.object but the result is an
 * OrigamiGraph instance.
 *
 * @this {AsyncDictionary|null}
 * @param {PlainObject} formulas
 */
export async function graph(formulas) {
  const fns = {};
  for (const key in formulas) {
    const code = formulas[key];
    const fn = code instanceof Array ? createExpressionFunction(code) : code;
    fns[key] = fn;
  }

  // Lazily load OrigamiGraph to avoid circular dependencies.
  if (!OrigamiGraph) {
    OrigamiGraph = (await import("../framework/OrigamiGraph.js")).default;
  }

  const result = new OrigamiGraph(fns);
  result.parent = this;
  return result;
}
graph.toString = () => "«ops.graph»";

/**
 * A website graph via HTTP.
 *
 * @this {AsyncDictionary|null}
 * @param {string} domain
 * @param  {...string} keys
 */
export function graphHttp(domain, ...keys) {
  return graphHttpBuiltin.call(this, domain, ...keys);
}
graphHttp.toString = () => "«ops.graphHttp»";

/**
 * A website graph via HTTPS.
 *
 * @this {AsyncDictionary|null}
 * @param {string} domain
 * @param  {...string} keys
 */
export function graphHttps(domain, ...keys) {
  return graphHttpsBuiltin.call(this, domain, ...keys);
}
graphHttps.toString = () => "«ops.graphHttps»";

/**
 * Retrieve a web resource via HTTP.
 *
 * @this {AsyncDictionary|null}
 * @param {string} domain
 * @param  {...string} keys
 */
export function http(domain, ...keys) {
  return httpBuiltin.call(this, domain, ...keys);
}
http.toString = () => "«ops.http»";

/**
 * Retrieve a web resource via HTTPS.
 *
 * @this {AsyncDictionary|null}
 * @param {string} domain
 * @param  {...string} keys
 */
export function https(domain, ...keys) {
  return httpsBuiltin.call(this, domain, ...keys);
}
https.toString = () => "«ops.https»";

/**
 * Search the inherited scope -- i.e., exclude the current graph -- for the
 * given key.
 *
 * @this {AsyncDictionary|null}
 * @param {*} key
 */
export async function inherited(key) {
  const scope = this;
  const scopeGraphs = /** @type {any} */ (scope).graphs ?? scope;
  const inheritedScope = new Scope(...scopeGraphs.slice(1));
  return inheritedScope.get(key);
}
inherited.toString = () => "«ops.inherited»";

/**
 * Return a function that will invoke the given code.
 *
 * @typedef {import("./code").Code} Code
 * @this {AsyncDictionary|null}
 * @param {Code} code
 */
export function lambda(code) {
  /** @this {AsyncDictionary|null} */
  return async function invoke(input) {
    // Add ambients to scope.
    const ambients = {
      "@input": input,
      "@recurse": invoke,
    };
    /** @type {import("@graphorigami/core").Graphable[]} */
    const graphs = [ambients];
    // Add input to scope.
    if (Graph.isGraphable(input)) {
      graphs.push(input);
    }
    if (this) {
      graphs.push(this);
    }
    const scope = graphs.length > 1 ? new Scope(...graphs) : graphs[0];
    const result = await execute.call(scope, code);
    return result;
  };
}
lambda.toString = () => "«ops.lambda»";

/**
 * Construct an object. The keys will be the same as the given `obj`
 * parameter's, and the values will be the results of evaluating the
 * corresponding code values in `obj`.
 *
 * @this {AsyncDictionary|null}
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
