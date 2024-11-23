/**
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
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
import { codeSymbol } from "./symbols.js";
import taggedTemplate from "./taggedTemplate.js";

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

  const builtins = Tree.root(this);
  const value = await builtins.get(key);
  if (value === undefined) {
    throw await builtinReferenceError(this, builtins, key);
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
 * This op is only used during parsing. It signals to ops.object that the
 * "arguments" of the expression should be used to define a property getter.
 */
export const getter = new String("«ops.getter»");

/**
 * Files tree for the user's home directory.
 *
 * @this {AsyncTree|null}
 */
export async function homeDirectory() {
  const tree = new OrigamiFiles(os.homedir());
  tree.parent = this ? Tree.root(this) : null;
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
  const context = this;

  /** @this {Treelike|null} */
  async function invoke(...args) {
    // Add arguments to scope.
    const ambients = {};
    for (const parameter of parameters) {
      ambients[parameter] = args.shift();
    }
    Object.defineProperty(ambients, codeSymbol, {
      value: code,
      enumerable: false,
    });
    const ambientTree = new ObjectTree(ambients);
    ambientTree.parent = context;

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
 * Files tree for the filesystem root.
 *
 * @this {AsyncTree|null}
 */
export async function rootDirectory(key) {
  let tree = new OrigamiFiles("/");
  // We set the builtins as the parent because logically the filesystem root is
  // outside the project. This ignores the edge case where the project itself is
  // the root of the filesystem and has a config file.
  tree.parent = this ? Tree.root(this) : null;
  return key ? tree.get(key) : tree;
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
  if (value === undefined && key !== "undefined") {
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
    "Internal error: a spread operation wasn't compiled correctly."
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

// Calc work

export async function conditional(condition, truthy, falsy) {
  return condition ? truthy() : falsy();
}

export async function equal(a, b) {
  return a == b;
}

export async function logicalAnd(head, ...tail) {
  if (!head) {
    return false;
  }
  // Evaluate the tail arguments in order, short-circuiting if any are falsy.
  let lastValue;
  for (const arg of tail) {
    lastValue = arg instanceof Function ? await arg() : arg;
    if (!lastValue) {
      return false;
    }
  }

  // Return the last value (not `true`)
  return lastValue;
}

export async function logicalOr(head, ...tail) {
  if (head) {
    return true;
  }
  // Evaluate the tail arguments in order, short-circuiting if any are truthy.
  for (const arg of tail) {
    const value = arg instanceof Function ? await arg() : arg;
    if (value) {
      return value;
    }
  }

  return false;
}

export async function notEqual(a, b) {
  return a != b;
}

export async function notStrictEqual(a, b) {
  return a !== b;
}

export async function nullishCoalescing(head, ...tail) {
  if (head != null) {
    return head;
  }
  for (const arg of tail) {
    const value = arg instanceof Function ? await arg() : arg;
    if (value != null) {
      return value;
    }
  }
  return null;
}

export async function strictEqual(a, b) {
  return a === b;
}
