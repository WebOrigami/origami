/**
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 */

import { SiteTree, Tree } from "@graphorigami/core";
import FileLoadersTransform from "./FileLoadersTransform.js";
import OrigamiFiles from "./OrigamiFiles.js";
import OrigamiTree from "./OrigamiTree.js";
import Scope from "./Scope.js";
import concatTreeValues from "./concatTreeValues.js";
import evaluate from "./evaluate.js";
import { createExpressionFunction } from "./expressionFunction.js";

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
  const tree = Tree.from(args);
  return concatTreeValues.call(this, tree);
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
  const mapped = keys.map((key) => (key === Tree.defaultValueKey ? "" : key));
  let href = [host, ...mapped].join("/");
  if (!href.startsWith(protocol)) {
    if (!href.startsWith("//")) {
      href = `//${href}`;
    }
    href = `${protocol}${href}`;
  }
  return href;
}

/**
 * Fetch the resource at the given href. If the result is a standard
 * ArrayBuffer, patch it to give it a more useful toString method like Node's
 * Buffer class has.
 *
 * @param {string} href
 */
async function fetchAndPatch(href) {
  const response = await fetch(href);
  if (response.ok) {
    const buffer = await response.arrayBuffer();
    if (buffer instanceof ArrayBuffer) {
      buffer.toString = function () {
        return new TextDecoder().decode(this);
      };
    }
  } else {
    return undefined;
  }
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
  return fetchAndPatch(href);
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
  return fetchAndPatch(href);
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
 * @typedef {import("../compiler/code.js").Code} Code
 * @this {AsyncTree|null}
 * @param {Code} code
 */
export function lambda(code) {
  /** @this {AsyncTree|null} */
  async function invoke(input) {
    // Add ambients to scope.
    const ambients = {
      _: input,
      "@recurse": invoke,
    };
    const scope = new Scope(ambients, this);
    const result = await evaluate.call(scope, code);
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
 * @this {AsyncTree|null}
 * @param {PlainObject} obj
 */
export async function object(obj) {
  const evaluated = {};
  for (const key in obj) {
    const code = obj[key];
    evaluated[key] = await evaluate.call(this, code);
  }
  return evaluated;
}
object.toString = () => "«ops.object»";

/**
 * Construct an tree. This is similar to ops.object but the result is an
 * OrigamiTree instance.
 *
 * @this {AsyncTree|null}
 * @param {PlainObject} formulas
 */
export async function tree(formulas) {
  const fns = {};
  for (const key in formulas) {
    const code = formulas[key];
    const fn = code instanceof Array ? createExpressionFunction(code) : code;
    fns[key] = fn;
  }
  return new OrigamiTree(fns);
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
