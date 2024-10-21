/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 */

import {
  ExplorableSiteTree,
  ObjectTree,
  SiteTree,
  Tree,
  isUnpackable,
  pathFromKeys,
  scope as scopeFn,
  trailingSlash,
  concat as treeConcat,
} from "@weborigami/async-tree";
import expressionObject from "./expressionObject.js";
import { handleExtension } from "./extensions.js";
import HandleExtensionsTransform from "./HandleExtensionsTransform.js";
import { evaluate } from "./internal.js";
import mergeTrees from "./mergeTrees.js";
import OrigamiFiles from "./OrigamiFiles.js";
import taggedTemplate from "./taggedTemplate.js";

// For memoizing lambda functions
const lambdaFnMap = new Map();

function addOpLabel(op, label) {
  Object.defineProperty(op, "toString", {
    value: () => label,
    enumerable: false,
  });
}

/**
 * Construct an array.
 *
 * @this {AsyncTree|null}
 * @param {any[]} items
 */
export async function array(...items) {
  return Array(...items);
}
addOpLabel(array, "«ops.array»");

/**
 * Look up the given key in the scope for the current tree the first time
 * the key is requested, holding on to the value for future requests.
 *
 * @this {AsyncTree|null}
 */
export async function cache(key, cache) {
  if (key in cache) {
    return cache[key];
  }
  // First save a promise for the value
  const promise = scope.call(this, key);
  cache[key] = promise;
  const value = await promise;
  // Now update with the actual value
  cache[key] = value;
  return value;
}

/**
 * Concatenate the given arguments.
 *
 * @this {AsyncTree|null}
 * @param {any[]} args
 */
export async function concat(...args) {
  return treeConcat.call(this, args);
}
addOpLabel(concat, "«ops.concat»");

/**
 * Find the indicated constructor in scope, then return a function which invokes
 * it with `new`.
 *
 * @this {AsyncTree}
 * @param  {...any} keys
 */
export async function constructor(...keys) {
  const tree = this;
  const scope = scopeFn(tree);
  let constructor = await Tree.traverseOrThrow(scope, ...keys);
  if (isUnpackable(constructor)) {
    constructor = await constructor.unpack();
  }
  // Origami may pass `undefined` as the first argument to the constructor. We
  // don't pass that along, because constructors like `Date` don't like it.
  return (...args) =>
    args.length === 1 && args[0] === undefined
      ? new constructor()
      : new constructor(...args);
}
addOpLabel(constructor, "«ops.constructor»");

/**
 * Given a protocol, a host, and a list of keys, construct an href.
 *
 * @param {string} protocol
 * @param {string} host
 * @param  {string[]} keys
 */
function constructHref(protocol, host, ...keys) {
  const path = pathFromKeys(keys);
  let href = [host, path].join("/");
  if (!href.startsWith(protocol)) {
    if (!href.startsWith("//")) {
      href = `//${href}`;
    }
    href = `${protocol}${href}`;
  }
  return href;
}

/**
 * Given a protocol, a host, and a list of keys, construct an href.
 *
 * @param {string} protocol
 * @param {import("../../index.ts").Constructor<AsyncTree>} treeClass
 * @param {AsyncTree|null} parent
 * @param {string} host
 * @param  {string[]} keys
 */
async function constructSiteTree(protocol, treeClass, parent, host, ...keys) {
  // If the last key doesn't end in a slash, remove it for now.
  let lastKey;
  if (keys.length > 0 && keys.at(-1) && !trailingSlash.has(keys.at(-1))) {
    lastKey = keys.pop();
  }

  const href = constructHref(protocol, host, ...keys);
  let result = new (HandleExtensionsTransform(treeClass))(href);
  result.parent = parent;

  return lastKey ? result.get(lastKey) : result;
}

/**
 * A site tree with JSON Keys via HTTPS.
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export function explorableSite(host, ...keys) {
  return constructSiteTree("https:", ExplorableSiteTree, this, host, ...keys);
}
addOpLabel(explorableSite, "«ops.explorableSite»");

/**
 * Fetch the resource at the given href.
 *
 * @this {AsyncTree|null}
 * @param {string} href
 */
async function fetchResponse(href) {
  const response = await fetch(href);
  if (!response.ok) {
    return undefined;
  }
  let buffer = await response.arrayBuffer();

  // Attach any loader defined for the file type.
  const url = new URL(href);
  const filename = url.pathname.split("/").pop();
  if (this && filename) {
    buffer = await handleExtension(this, buffer, filename);
  }

  return buffer;
}

/**
 * This op is only used during parsing. It signals to ops.object that the
 * "arguments" of the expression should be used to define a property getter.
 */
export const getter = new String("«ops.getter»");

/**
 * Construct a files tree for the filesystem root.
 *
 * @this {AsyncTree|null}
 */
export async function filesRoot() {
  let root = new OrigamiFiles("/");

  // The root itself needs a parent so that expressions evaluated within it
  // (e.g., Origami expressions loaded from .ori files) will have access to
  // things like the built-in functions.
  root.parent = this;

  return root;
}

/**
 * Retrieve a web resource via HTTP.
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export async function http(host, ...keys) {
  const href = constructHref("http:", host, ...keys);
  return fetchResponse.call(this, href);
}
addOpLabel(http, "«ops.http»");

/**
 * Retrieve a web resource via HTTPS.
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export function https(host, ...keys) {
  const href = constructHref("https:", host, ...keys);
  return fetchResponse.call(this, href);
}
addOpLabel(https, "«ops.https»");

/**
 * Search the parent's scope -- i.e., exclude the current tree -- for the given
 * key.
 *
 * @this {AsyncTree|null}
 * @param {*} key
 */
export async function inherited(key) {
  if (!this?.parent) {
    return undefined;
  }
  const parentScope = scopeFn(this.parent);
  return parentScope.get(key);
}
addOpLabel(inherited, "«ops.inherited»");

/**
 * Return a function that will invoke the given code.
 *
 * @typedef {import("../../index.ts").Code} Code
 * @this {AsyncTree|null}
 * @param {string[]} parameters
 * @param {Code} code
 */

export function lambda(parameters, code) {
  if (lambdaFnMap.has(code)) {
    return lambdaFnMap.get(code);
  }

  /** @this {AsyncTree|null} */
  async function invoke(...args) {
    // Add arguments to scope.
    const ambients = {};
    for (const parameter of parameters) {
      ambients[parameter] = args.shift();
    }
    const ambientTree = new ObjectTree(ambients);
    ambientTree.parent = this;

    let result = await evaluate.call(ambientTree, code);

    // Bind a function result to the ambients so that it has access to the
    // parameter values -- i.e., like a closure.
    if (result instanceof Function) {
      const resultCode = result.code;
      result = result.bind(ambientTree);
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
  const fnLength = parameters.length;
  Object.defineProperty(invoke, "length", {
    value: fnLength,
  });

  invoke.code = code;
  lambdaFnMap.set(code, invoke);
  return invoke;
}
addOpLabel(lambda, "«ops.lambda");

/**
 * Return a primitive value
 */
export async function literal(value) {
  return value;
}
addOpLabel(literal, "«ops.literal»");

/**
 * Merge the given trees. If they are all plain objects, return a plain object.
 *
 * @this {AsyncTree|null}
 * @param {import("@weborigami/async-tree").Treelike[]} trees
 */
export async function merge(...trees) {
  return mergeTrees.call(this, ...trees);
}
addOpLabel(merge, "«ops.merge»");

/**
 * Construct an object. The keys will be the same as the given `obj`
 * parameter's, and the values will be the results of evaluating the
 * corresponding code values in `obj`.
 *
 * @this {AsyncTree|null}
 * @param {any[]} entries
 */
export async function object(...entries) {
  return expressionObject(entries, this);
}
addOpLabel(object, "«ops.object»");

/**
 * Look up the given key in the scope for the current tree.
 *
 * @this {AsyncTree|null}
 */
export async function scope(key) {
  if (!this) {
    throw new Error("Tried to get the scope of a null or undefined tree.");
  }
  const scope = scopeFn(this);
  return scope.get(key);
}
addOpLabel(scope, "«ops.scope»");

/**
 * The spread operator is a placeholder during parsing. It should be replaced
 * with an object merge.
 */
export function spread(...args) {
  throw new Error(
    "A compile-time spread operator wasn't converted to an object merge."
  );
}
addOpLabel(spread, "«ops.spread»");

/**
 * Apply the default tagged template function.
 */
export function template(strings, ...values) {
  return taggedTemplate(strings, values);
}
addOpLabel(template, "«ops.template»");

/**
 * Traverse a path of keys through a tree.
 */
export const traverse = Tree.traverseOrThrow;

/**
 * A website tree via HTTP.
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export function treeHttp(host, ...keys) {
  return constructSiteTree("http:", SiteTree, this, host, ...keys);
}
addOpLabel(treeHttp, "«ops.treeHttp»");

/**
 * A website tree via HTTPS.
 *
 * @this {AsyncTree|null}
 * @param {string} host
 * @param  {...string} keys
 */
export function treeHttps(host, ...keys) {
  return constructSiteTree("https:", SiteTree, this, host, ...keys);
}
addOpLabel(treeHttps, "«ops.treeHttps»");

/**
 * If the value is packed but has an unpack method, call it and return that as
 * the result; otherwise, return the value as is.
 *
 * @param {any} value
 */
export async function unpack(value) {
  return isUnpackable(value) ? value.unpack() : value;
}
