/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 */

import {
  ObjectTree,
  Tree,
  isUnpackable,
  scope as scopeFn,
  concat as treeConcat,
} from "@weborigami/async-tree";
import os from "node:os";
import { builtinReferenceError, scopeReferenceError } from "./errors.js";
import expressionObject from "./expressionObject.js";
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
  return items;
}
addOpLabel(array, "«ops.array»");

/**
 * Like ops.scope, but only searches for a builtin at the top of the scope
 * chain.
 *
 * @this {AsyncTree|null}
 */
export async function builtin(key) {
  if (!this) {
    throw new Error("Tried to get the scope of a null or undefined tree.");
  }
  let current = this;
  while (current.parent) {
    current = current.parent;
  }

  const value = await current.get(key);
  if (value === undefined) {
    throw await builtinReferenceError(this, current, key);
  }

  return value;
}

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
 * This op is only used during parsing. It signals to ops.object that the
 * "arguments" of the expression should be used to define a property getter.
 */
export const getter = new String("«ops.getter»");

/**
 * Files tree for the filesystem root.
 *
 * @this {AsyncTree|null}
 */
export async function filesRoot() {
  let tree = new OrigamiFiles("/");
  tree.parent = root(this);
  return tree;
}

/**
 * Files tree for the user's home directory.
 *
 * @this {AsyncTree|null}
 */
export async function homeTree() {
  const tree = new OrigamiFiles(os.homedir());
  tree.parent = root(this);
  return tree;
}

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

// Return the root of the given tree. For an Origami tree, this gives us
// a way of acessing the builtins.
function root(tree) {
  let current = tree;
  while (current.parent) {
    current = current.parent;
  }
  return current;
}

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
  const value = await scope.get(key);
  if (value === undefined) {
    throw await scopeReferenceError(scope, key);
  }
  return value;
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
 * If the value is packed but has an unpack method, call it and return that as
 * the result; otherwise, return the value as is.
 *
 * @param {any} value
 */
export async function unpack(value) {
  return isUnpackable(value) ? value.unpack() : value;
}
