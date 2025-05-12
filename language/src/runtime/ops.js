/**
 * @typedef {import("../../index.ts").AnnotatedCode} AnnotatedCode
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 */

import {
  ObjectTree,
  Tree,
  deepText,
  isUnpackable,
  scope as scopeFn,
  text as templateFunctionTree,
} from "@weborigami/async-tree";
import os from "node:os";
import { builtinReferenceError, scopeReferenceError } from "./errors.js";
import expressionObject from "./expressionObject.js";
import { evaluate } from "./internal.js";
import mergeTrees from "./mergeTrees.js";
import OrigamiFiles from "./OrigamiFiles.js";
import { codeSymbol } from "./symbols.js";
import templateFunctionIndent from "./templateIndent.js";
import templateFunctionStandard from "./templateStandard.js";

function addOpLabel(op, label) {
  Object.defineProperty(op, "toString", {
    value: () => label,
    enumerable: false,
  });
}

export function addition(a, b) {
  return a + b;
}
addOpLabel(addition, "«ops.addition»");

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

export function bitwiseAnd(a, b) {
  return a & b;
}
addOpLabel(bitwiseAnd, "«ops.bitwiseAnd»");

export function bitwiseNot(a) {
  return ~a;
}
addOpLabel(bitwiseNot, "«ops.bitwiseNot»");

export function bitwiseOr(a, b) {
  return a | b;
}
addOpLabel(bitwiseOr, "«ops.bitwiseOr»");

export function bitwiseXor(a, b) {
  return a ^ b;
}
addOpLabel(bitwiseXor, "«ops.bitwiseXor»");

/**
 * JavaScript comma operator, returns the last argument.
 *
 * @param  {...any} args
 * @returns
 */
export function comma(...args) {
  return args.at(-1);
}
addOpLabel(comma, "«ops.comma»");

/**
 * Concatenate the given arguments.
 *
 * @this {AsyncTree|null}
 * @param {any[]} args
 */
export async function concat(...args) {
  return deepText.call(this, args);
}
addOpLabel(concat, "«ops.concat»");

export async function conditional(condition, truthy, falsy) {
  const value = condition ? truthy : falsy;
  return value instanceof Function ? await value() : value;
}

export async function construct(constructor, ...args) {
  if (isUnpackable(constructor)) {
    constructor = await constructor.unpack();
  }
  return Reflect.construct(constructor, args);
}

export function division(a, b) {
  return a / b;
}
addOpLabel(division, "«ops.division»");

export function equal(a, b) {
  return a == b;
}
addOpLabel(equal, "«ops.equal»");

export function exponentiation(a, b) {
  return a ** b;
}
addOpLabel(exponentiation, "«ops.exponentiation»");

/**
 * Look up the given key as an external reference and cache the value for future
 * requests.
 *
 * @this {AsyncTree|null}
 */
export async function external(path, code, cache) {
  if (!this) {
    throw new Error("Tried to get the scope of a null or undefined tree.");
  }

  if (path in cache) {
    // Cache hit
    return cache[path];
  }

  // Don't await: might get another request for this before promise resolves
  const promise = evaluate.call(this, code);
  // Save promise so another request will get the same promise
  cache[path] = promise;

  // Now wait for the value
  const value = await promise;

  // Update the cache with the actual value
  cache[path] = value;

  return value;
}
addOpLabel(external, "«ops.external»");
external.unevaluatedArgs = true;

/**
 * Flatten the values of the given trees
 *
 * @param {...any} args
 */
export async function flat(...args) {
  const arrays = await Promise.all(
    args.map(async (arg) =>
      arg instanceof Array || typeof arg !== "object"
        ? arg
        : await Tree.values(arg)
    )
  );

  return arrays.flat();
}
addOpLabel(flat, "«ops.flat»");

/**
 * Like ops.scope, but only searches for a global at the top of the scope
 * chain.
 *
 * @this {AsyncTree|null}
 */
export async function global(key) {
  if (!this) {
    throw new Error("Tried to get the scope of a null or undefined tree.");
  }

  const globals = Tree.root(this);
  const value = await globals.get(key);
  if (value === undefined) {
    throw await builtinReferenceError(this, globals, key);
  }

  return value;
}
addOpLabel(global, "«ops.global»");
/**
 * This op is only used during parsing. It signals to ops.object that the
 * "arguments" of the expression should be used to define a property getter.
 */
export const getter = new String("«ops.getter»");

export function greaterThan(a, b) {
  return a > b;
}
addOpLabel(greaterThan, "«ops.greaterThan»");

export function greaterThanOrEqual(a, b) {
  return a >= b;
}
addOpLabel(greaterThanOrEqual, "«ops.greaterThanOrEqual»");

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
addOpLabel(homeDirectory, "«ops.homeDirectory»");

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
  const value = await parentScope.get(key);
  return value;
}
addOpLabel(inherited, "«ops.inherited»");

/**
 * Return a function that will invoke the given code.
 *
 * @this {AsyncTree|null}
 * @param {string[]} parameters
 * @param {AnnotatedCode} code
 */
export function lambda(parameters, code) {
  const context = this;

  /** @this {Treelike|null} */
  async function invoke(...args) {
    let target;
    if (parameters.length === 0) {
      // No parameters
      target = context;
    } else {
      // Add arguments to scope.
      const ambients = {};
      for (const parameter of parameters) {
        const parameterName = parameter[1];
        ambients[parameterName] = args.shift();
      }
      Object.defineProperty(ambients, codeSymbol, {
        value: code,
        enumerable: false,
      });
      const ambientTree = new ObjectTree(ambients);
      ambientTree.parent = context;
      target = ambientTree;
    }

    let result = await evaluate.call(target, code);

    // Bind a function result to the ambients so that it has access to the
    // parameter values -- i.e., like a closure.
    if (result instanceof Function) {
      const resultCode = result.code;
      result = result.bind(target);
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
lambda.unevaluatedArgs = true;

export function lessThan(a, b) {
  return a < b;
}
addOpLabel(lessThan, "«ops.lessThan»");

export function lessThanOrEqual(a, b) {
  return a <= b;
}
addOpLabel(lessThanOrEqual, "«ops.lessThanOrEqual»");

/**
 * Return a primitive value
 *
 * This op is optimized away during compilation, with the exception of array
 * literals.
 */
export async function literal(value) {
  return value;
}
addOpLabel(literal, "«ops.literal»");
literal.unevaluatedArgs = true;

/**
 * Walk up the parent tree by the indicated number of ancestors, then ask that
 * tree for the given key.
 *
 * @this {AsyncTree|null}
 * @param {number} ancestor
 * @param {any} key
 */
export async function local(ancestor, key) {
  const message = `Internal error: couldn't find local key: ${key}`;
  if (!this) {
    throw new Error(message);
  }
  let tree = this;
  for (let i = 0; i < ancestor; i++) {
    if (!tree.parent) {
      throw new Error(message);
    }
    tree = tree.parent;
  }
  const value = await tree.get(key);
  return value;
}

/**
 * Logical AND operator
 */
export async function logicalAnd(head, ...tail) {
  if (!head) {
    return head;
  }
  // Evaluate the tail arguments in order, short-circuiting if any are falsy.
  let lastValue;
  for (const arg of tail) {
    lastValue = arg instanceof Function ? await arg() : arg;
    if (!lastValue) {
      return lastValue;
    }
  }

  // Return the last value (not `true`)
  return lastValue;
}
addOpLabel(logicalAnd, "«ops.logicalAnd»");

/**
 * Logical NOT operator
 */
export async function logicalNot(value) {
  return !value;
}
addOpLabel(logicalNot, "«ops.logicalNot»");

/**
 * Logical OR operator
 */
export async function logicalOr(head, ...tail) {
  if (head) {
    return head;
  }

  // Evaluate the tail arguments in order, short-circuiting if any are truthy.
  let lastValue;
  for (const arg of tail) {
    lastValue = arg instanceof Function ? await arg() : arg;
    if (lastValue) {
      return lastValue;
    }
  }

  return lastValue;
}
addOpLabel(logicalOr, "«ops.logicalOr»");

/**
 * Merge the given trees. If they are all plain objects, return a plain object.
 *
 * @this {AsyncTree|null}
 * @param {any[]} trees
 */
export async function merge(...trees) {
  return mergeTrees.call(this, ...trees);
}
addOpLabel(merge, "«ops.merge»");

export function multiplication(a, b) {
  return a * b;
}
addOpLabel(multiplication, "«ops.multiplication»");

export function notEqual(a, b) {
  return a != b;
}
addOpLabel(notEqual, "«ops.notEqual»");

export function notStrictEqual(a, b) {
  return a !== b;
}
addOpLabel(notStrictEqual, "«ops.notStrictEqual»");

/**
 * Nullish coalescing operator
 */
export async function nullishCoalescing(head, ...tail) {
  if (head != null) {
    return head;
  }

  let lastValue;
  for (const arg of tail) {
    lastValue = arg instanceof Function ? await arg() : arg;
    if (lastValue != null) {
      return lastValue;
    }
  }

  return lastValue;
}
addOpLabel(nullishCoalescing, "«ops.nullishCoalescing»");

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
object.unevaluatedArgs = true;

export function optionalTraverse(treelike, key) {
  if (!treelike) {
    return undefined;
  }
  return Tree.traverseOrThrow(treelike, key);
}
addOpLabel(optionalTraverse, "«ops.optionalTraverse");

export function remainder(a, b) {
  return a % b;
}
addOpLabel(remainder, "«ops.remainder»");

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
addOpLabel(rootDirectory, "«ops.rootDirectory»");

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

export function shiftLeft(a, b) {
  return a << b;
}
addOpLabel(shiftLeft, "«ops.shiftLeft»");

export function shiftRightSigned(a, b) {
  return a >> b;
}
addOpLabel(shiftRightSigned, "«ops.shiftRightSigned»");

export function shiftRightUnsigned(a, b) {
  return a >>> b;
}
addOpLabel(shiftRightUnsigned, "«ops.shiftRightUnsigned»");

/**
 * The spread operator is a placeholder during parsing. It should be replaced
 * with an object merge.
 */
export function spread(arg) {
  throw new Error(
    "Internal error: a spread operation wasn't compiled correctly."
  );
}
addOpLabel(spread, "«ops.spread»");

export function strictEqual(a, b) {
  return a === b;
}
addOpLabel(strictEqual, "«ops.strictEqual»");

export function subtraction(a, b) {
  return a - b;
}
addOpLabel(subtraction, "«ops.subtraction»");

/**
 * Apply the tree indent tagged template function.
 */
export async function templateIndent(strings, ...values) {
  return templateFunctionIndent(strings, ...values);
}
addOpLabel(templateIndent, "«ops.templateIndent»");

/**
 * Apply the default tagged template function.
 */
export function templateStandard(strings, ...values) {
  return templateFunctionStandard(strings, ...values);
}
addOpLabel(templateStandard, "«ops.templateStandard»");

/**
 * Apply the tree tagged template function.
 */
export async function templateTree(strings, ...values) {
  return templateFunctionTree(strings, ...values);
}
addOpLabel(templateTree, "«ops.templateTree»");

/**
 * Traverse a path of keys through a tree.
 */
export const traverse = Tree.traverseOrThrow;

export function unaryMinus(a) {
  return -a;
}
addOpLabel(unaryMinus, "«ops.unaryMinus»");

export function unaryPlus(a) {
  return +a;
}
addOpLabel(unaryPlus, "«ops.unaryPlus»");

/**
 * If the value is packed but has an unpack method, call it and return that as
 * the result; otherwise, return the value as is.
 *
 * @param {any} value
 */
export async function unpack(value) {
  return isUnpackable(value) ? value.unpack() : value;
}
addOpLabel(unpack, "«ops.unpack»");
