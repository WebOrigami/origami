/**
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 */

import filesBuiltin from "../builtins/@files.js";
import httpBuiltin from "../builtins/@http.js";
import httpsBuiltin from "../builtins/@https.js";
import concatBuiltin from "../builtins/@tree/concat.js";
import treeHttpBuiltin from "../builtins/@treeHttp.js";
import treeHttpsBuiltin from "../builtins/@treeHttps.js";
import Scope from "../common/Scope.js";
import execute from "./execute.js";
import { createExpressionFunction } from "./expressionFunction.js";

// Lazily load OrigamiTree to avoid circular dependencies.
const origamiTreePromise = import("../framework/OrigamiTree.js").then(
  (exports) => exports.default
);

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
 * Construct a files tree for the filesystem root.
 *
 * @this {AsyncDictionary|null}
 */
export async function filesRoot() {
  const root = await filesBuiltin.call(this, "/");

  // The root itself needs a parent so that expressions evaluated within it
  // (e.g., Origami expressions loaded from .ori files) will have access to
  // things like the built-in functions.
  root.parent = this;

  return root;
}

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
 * Search the inherited scope -- i.e., exclude the current tree -- for the
 * given key.
 *
 * @this {AsyncDictionary|null}
 * @param {*} key
 */
export async function inherited(key) {
  const scope = this;
  const scopeTrees = /** @type {any} */ (scope).trees ?? scope;
  const inheritedScope = new Scope(...scopeTrees.slice(1));
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
  async function invoke(input) {
    // Add ambients to scope.
    const ambients = {
      _: input,
      "@recurse": invoke,
    };
    const scope = new Scope(ambients, this);
    const result = await execute.call(scope, code);
    return result;
  }
  invoke.code = code;
  return invoke;
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
  const evaluated = {};
  for (const key in obj) {
    const code = obj[key];
    evaluated[key] = await execute.call(this, code);
  }
  return evaluated;
}
object.toString = () => "«ops.object»";

/**
 * Construct an tree. This is similar to ops.object but the result is an
 * OrigamiTree instance.
 *
 * @this {AsyncDictionary|null}
 * @param {PlainObject} formulas
 */
export async function tree(formulas) {
  const fns = {};
  for (const key in formulas) {
    const code = formulas[key];
    const fn = code instanceof Array ? createExpressionFunction(code) : code;
    fns[key] = fn;
  }

  const OrigamiTree = await origamiTreePromise;
  return new OrigamiTree(fns);
}
tree.toString = () => "«ops.tree»";

/**
 * A website tree via HTTP.
 *
 * @this {AsyncDictionary|null}
 * @param {string} domain
 * @param  {...string} keys
 */
export function treeHttp(domain, ...keys) {
  return treeHttpBuiltin.call(this, domain, ...keys);
}
treeHttp.toString = () => "«ops.treeHttp»";

/**
 * A website tree via HTTPS.
 *
 * @this {AsyncDictionary|null}
 * @param {string} domain
 * @param  {...string} keys
 */
export function treeHttps(domain, ...keys) {
  return treeHttpsBuiltin.call(this, domain, ...keys);
}
treeHttps.toString = () => "«ops.treeHttps»";

// The scope op is a placeholder for the tree's scope.
export const scope = "«ops.scope»";

// The `thisKey` op is a placeholder that represents the key of the object that
// resulted in the current code.
export const thisKey = "«ops.thisKey»";
