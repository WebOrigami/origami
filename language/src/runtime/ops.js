/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 */

import { SiteTree, Tree } from "@weborigami/async-tree";
import FileLoadersTransform from "./FileLoadersTransform.js";
import OrigamiFiles from "./OrigamiFiles.js";
import Scope from "./Scope.js";
import concatTreeValues from "./concatTreeValues.js";
import { OrigamiTree, evaluate, expressionFunction } from "./internal.js";

// For memoizing lambda functions
const lambdaFnMap = new Map();

/**
 * Construct an array.
 *
 * @this {AsyncTree|null}
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
 * @this {AsyncTree|null}
 * @param {any[]} args
 */
export async function concat(...args) {
  return concatTreeValues.call(this, args);
}
concat.toString = () => "«ops.concat»";

/**
 * Given a protocol, a host, and a list of keys, construct an href.
 *
 * @param {string} protocol
 * @param {string} host
 * @param  {...string|Symbol} keys
 */
function constructHref(protocol, host, ...keys) {
  let href = [host, ...keys].join("/");
  if (!href.startsWith(protocol)) {
    if (!href.startsWith("//")) {
      href = `//${href}`;
    }
    href = `${protocol}${href}`;
  }
  return href;
}

/**
 * Fetch the resource at the given href.
 *
 * @param {string} href
 */
async function fetchResponse(href) {
  const response = await fetch(href);
  return response.ok ? await response.arrayBuffer() : undefined;
}

/**
 * Construct a files tree for the filesystem root.
 *
 * @this {AsyncTree|null}
 */
export async function filesRoot() {
  /** @type {AsyncTree} */
  let root = new OrigamiFiles("/");

  // The root itself needs a scope so that expressions evaluated within it
  // (e.g., Origami expressions loaded from .ori files) will have access to
  // things like the built-in functions.
  root = Scope.treeWithScope(root, this);

  return root;
}

/**
 * Retrieve a web resource via HTTP.
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string|Symbol} keys
 */
export async function http(host, ...keys) {
  const href = constructHref("http:", host, ...keys);
  return fetchResponse(href);
}
http.toString = () => "«ops.http»";

/**
 * Retrieve a web resource via HTTPS.
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string|Symbol} keys
 */
export function https(host, ...keys) {
  const href = constructHref("https:", host, ...keys);
  return fetchResponse(href);
}
https.toString = () => "«ops.https»";

/**
 * Search the inherited scope -- i.e., exclude the current tree -- for the
 * given key.
 *
 * @this {AsyncTree|null}
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
 * @typedef {import("../../../language/src/compiler/code.js").Code} Code
 * @this {AsyncTree|null}
 * @param {string[]} parameters
 * @param {Code} code
 */
export function lambda(parameters, code) {
  if (lambdaFnMap.has(code)) {
    return lambdaFnMap.get(code);
  }

  // By default, the first input argument is named `_`.
  parameters ??= ["_"];

  /** @this {AsyncTree|null} */
  async function invoke(...args) {
    // Add arguments and @recurse to scope.
    const ambients = {};
    for (const parameter of parameters) {
      ambients[parameter] = args.shift();
    }
    ambients["@recurse"] = invoke;
    const scope = new Scope(ambients, this);

    let result = await evaluate.call(scope, code);

    // Bind a function result to the scope so that it has access to the
    // parameter values -- i.e., like a closure.
    if (result instanceof Function) {
      const resultCode = result.code;
      result = result.bind(scope);
      if (code) {
        // Copy over Origami code
        result.code = resultCode;
      }
    }

    return result;
  }

  // We set the `length` property on the function so that Tree.traverseOrThrow()
  // will correctly identify how many parameters it wants. This is unorthodox
  // but doesn't appear to affect other behavior.
  const fnLength = Object.keys(parameters).length;
  Object.defineProperty(invoke, "length", {
    value: fnLength,
  });

  invoke.code = code;
  lambdaFnMap.set(code, invoke);
  return invoke;
}
lambda.toString = () => "«ops.lambda»";

/**
 * Construct an object. The keys will be the same as the given `obj`
 * parameter's, and the values will be the results of evaluating the
 * corresponding code values in `obj`.
 *
 * @this {AsyncTree|null}
 * @param {any[]} entries
 */
export async function object(...entries) {
  const scope = this;
  const promises = entries.map(async ([key, value]) => [
    key,
    await evaluate.call(scope, value),
  ]);
  const evaluated = await Promise.all(promises);
  return Object.fromEntries(evaluated);
}
object.toString = () => "«ops.object»";

/**
 * Traverse a path of keys through a tree.
 */
export const traverse = Tree.traverseOrThrow;

/**
 * Construct an tree. This is similar to ops.object but the values are turned
 * into functions rather than being immediately evaluated, and the result is an
 * OrigamiTree.
 *
 * @this {AsyncTree|null}
 * @param {any[]} entries
 */
export async function tree(...entries) {
  const fns = entries.map(([key, code]) => {
    const value =
      code instanceof Array
        ? expressionFunction.createExpressionFunction(code)
        : code;
    return [key, value];
  });
  const object = Object.fromEntries(fns);
  const result = new OrigamiTree(object);
  result.scope = new Scope(result, this);
  return result;
}
tree.toString = () => "«ops.tree»";

/**
 * A website tree via HTTP.
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string|Symbol} keys
 */
export function treeHttp(host, ...keys) {
  const href = constructHref("http:", host, ...keys);
  /** @type {AsyncTree} */
  let result = new (FileLoadersTransform(SiteTree))(href);
  result = Scope.treeWithScope(result, this);
  return result;
}
treeHttp.toString = () => "«ops.treeHttp»";

/**
 * A website tree via HTTPS.
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string|Symbol} keys
 */
export function treeHttps(host, ...keys) {
  const href = constructHref("https:", host, ...keys);
  /** @type {AsyncTree} */
  let result = new (FileLoadersTransform(SiteTree))(href);
  result = Scope.treeWithScope(result, this);
  return result;
}
treeHttps.toString = () => "«ops.treeHttps»";

// The scope op is a placeholder for the tree's scope.
export const scope = "«ops.scope»";
