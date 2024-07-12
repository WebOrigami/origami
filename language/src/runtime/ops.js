/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 */

import {
  ObjectTree,
  SiteTree,
  Tree,
  isUnpackable,
  scope as scopeFn,
  symbols,
  concat as treeConcat,
} from "@weborigami/async-tree";
import handleExtension from "./handleExtension.js";
import HandleExtensionsTransform from "./HandleExtensionsTransform.js";
import { evaluate } from "./internal.js";
import mergeTrees from "./mergeTrees.js";
import OrigamiFiles from "./OrigamiFiles.js";

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
  return treeConcat.call(this, args);
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
constructor.toString = () => "«ops.constructor»";

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
    buffer = await handleExtension(this, filename, buffer);
  }

  return buffer;
}

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
 * @param  {...string|Symbol} keys
 */
export async function http(host, ...keys) {
  const href = constructHref("http:", host, ...keys);
  return fetchResponse.call(this, href);
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
  return fetchResponse.call(this, href);
}
https.toString = () => "«ops.https»";

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
inherited.toString = () => "«ops.inherited»";

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
  const fnLength = Object.keys(parameters).length;
  Object.defineProperty(invoke, "length", {
    value: fnLength,
  });

  invoke.code = code;
  lambdaFnMap.set(code, invoke);
  return invoke;
}
lambda.toString = () => "«ops.lambda";

/**
 * Merge the given trees. If they are all plain objects, return a plain object.
 *
 * @this {AsyncTree|null}
 * @param {import("@weborigami/async-tree").Treelike[]} trees
 */
export async function merge(...trees) {
  return mergeTrees.call(this, ...trees);
}
merge.toString = () => "«ops.merge»";

/**
 * Construct an object. The keys will be the same as the given `obj`
 * parameter's, and the values will be the results of evaluating the
 * corresponding code values in `obj`.
 *
 * @this {AsyncTree|null}
 * @param {any[]} entries
 */
export async function object(...entries) {
  const tree = this;
  const promises = entries.map(async ([key, value]) => [
    key,
    await evaluate.call(tree, value),
  ]);
  const evaluated = await Promise.all(promises);
  return Object.fromEntries(evaluated);
}
object.toString = () => "«ops.object»";

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
scope.toString = () => "«ops.scope»";

/**
 * The spread operator is a placeholder during parsing. It should be replaced
 * with an object merge.
 */
export function spread(...args) {
  throw new Error(
    "A compile-time spread operator wasn't converted to an object merge."
  );
}
spread.toString = () => "«ops.spread»";

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
  // Convert the non-code entries to plain properties.
  const object = {};
  let tree;
  for (const [key, value] of entries) {
    if (value instanceof Array) {
      const code = value;
      // Add a code entry as a property getter

      let get;
      const extname = extensions.extname(key);
      if (extname) {
        // Key has extension, getter will invoke code then attach unpack method.
        get = async () => {
          tree ??= new ObjectTree(this);
          const result = await evaluate.call(tree, code);
          return extensions.attachUnpackMethodIfPacked(tree, extname, result);
        };
      } else {
        // No extension, so getter just invoke code.
        get = () => {
          tree ??= new ObjectTree(this);
          return evaluate.call(tree, code);
        };
      }

      Object.defineProperty(object, key, { enumerable: true, get });
    } else {
      // Add a primitive entry as a regular property
      object[key] = value;
    }
  }
  Object.defineProperty(object, symbols.parent, {
    value: this,
    writable: true,
    configurable: true,
    enumerable: false,
  });
  return object;
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
  let result = new (HandleExtensionsTransform(SiteTree))(href);
  result.parent = this;
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
  let result = new (HandleExtensionsTransform(SiteTree))(href);
  result.parent = this;
  return result;
}
treeHttps.toString = () => "«ops.treeHttps»";
