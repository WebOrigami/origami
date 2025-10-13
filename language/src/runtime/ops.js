/**
 * @typedef {import("../../index.ts").AnnotatedCode} AnnotatedCode
 * @typedef {import("@weborigami/async-tree").PlainObject} PlainObject
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("@weborigami/types").AsyncTree} AsyncTree
 * @typedef {import("../../index.ts").RuntimeState} RuntimeState
 */

import { isUnpackable, symbols, Tree } from "@weborigami/async-tree";
import os from "node:os";
import expressionObject from "./expressionObject.js";
import { evaluate } from "./internal.js";
import mergeTrees from "./mergeTrees.js";
import OrigamiFiles from "./OrigamiFiles.js";
import { codeSymbol } from "./symbols.js";

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
 * Cache the value of the code for an external reference
 *
 * @param {any} cache
 * @param {string} path
 * @param {AnnotatedCode} code
 */
export async function cache(cache, path, code) {
  if (path in cache) {
    // Cache hit
    return cache[path];
  }

  // Don't await: might get another request for this before promise resolves
  const promise = await evaluate(code);

  // Save promise so another request will get the same promise
  cache[path] = promise;

  // Now wait for the value
  const value = await promise;

  // Update the cache with the actual value
  cache[path] = value;

  return value;
}
addOpLabel(cache, "«ops.cache»");
cache.unevaluatedArgs = true;

/**
 * JavaScript comma operator, returns the last argument.
 *
 * @param  {...AnnotatedCode} args
 */
export async function comma(...args) {
  let result;
  for (const arg of args) {
    result = await evaluate(arg);
  }
  return result;
}
addOpLabel(comma, "«ops.comma»");
comma.unevaluatedArgs = true;

/**
 * Concatenate the given arguments.
 *
 * @param {any[]} args
 */
export async function concat(...args) {
  return Tree.deepText(args);
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
 */
export async function homeDirectory(...keys) {
  const tree = new OrigamiFiles(os.homedir());
  return keys.length > 0 ? Tree.traverse(tree, ...keys) : tree;
}
addOpLabel(homeDirectory, "«ops.homeDirectory»");

/**
 * Given the tree currently be using as the context for the runtime, walk up the
 * parent chain `depth` levels and return that tree.
 *
 * @param {number} depth
 * @param {RuntimeState} state
 */
export async function inherited(depth, state) {
  let current = state.context;
  for (let i = 0; i < depth; i++) {
    if (!current) {
      throw new ReferenceError(
        `Origami internal error: Can't find context object`
      );
    }
    current = current.parent ?? current[symbols.parent];
  }
  return current;
}
addOpLabel(inherited, "«ops.inherited»");
inherited.needsState = true;

/**
 * Return a function that will invoke the given code.
 *
 * @param {string[]} parameters
 * @param {AnnotatedCode} code
 */
export function lambda(parameters, code, state = {}) {
  const stack = state.stack ?? [];

  async function invoke(...args) {
    let newState;
    if (parameters.length === 0) {
      // No parameters
      newState = state;
    } else {
      // Create a stack frame for the parameters
      const frame = {};
      for (const parameter of parameters) {
        const parameterName = parameter[1];
        frame[parameterName] = args.shift();
      }
      // Record which code this stack frame is associated with
      Object.defineProperty(frame, codeSymbol, {
        value: code,
        enumerable: false,
      });
      const newStack = stack.slice();
      newStack.push(frame);
      newState = Object.assign({}, state, { stack: newStack });
    }

    const result = await evaluate(code, newState);
    return result;
  }

  // Retain a reference to the original code for debugging, and so that functions
  // can be compared by their code (e.g., for caching purposes).
  invoke.code = code;

  // We set the `length` property on the function so that Tree.traverseOrThrow()
  // will correctly identify how many parameters it wants. This is unorthodox
  // but doesn't appear to affect other behavior.
  const fnLength = parameters.length;
  Object.defineProperty(invoke, "length", {
    value: fnLength,
  });

  return invoke;
}
addOpLabel(lambda, "«ops.lambda»");
lambda.unevaluatedArgs = true;
lambda.needsState = true;

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
  if (value instanceof Array) {
    // Strip code properties like `source`
    return [...value];
  } else {
    return value;
  }
}
addOpLabel(literal, "«ops.literal»");
literal.unevaluatedArgs = true;

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
 * @param {any[]} trees
 */
export async function merge(...trees) {
  return mergeTrees(...trees);
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
 * @param {any[]} entries
 */
export async function object(...entries) {
  const state = entries.pop();
  return expressionObject(entries, state);
}
addOpLabel(object, "«ops.object»");
object.unevaluatedArgs = true;
object.needsState = true;

/**
 * Return the stack frame that's `depth` levels up the stack.
 *
 * @param {number} depth
 * @param {RuntimeState} state
 */
export async function params(depth, state = {}) {
  const stack = state.stack ?? [];
  return stack[stack.length - 1 - depth];
}
addOpLabel(params, "«ops.params»");
params.needsState = true;

// export function optionalTraverse(treelike, key) {
//   if (!treelike) {
//     return undefined;
//   }
//   return Tree.traverseOrThrow(treelike, key);
// }
// addOpLabel(optionalTraverse, "«ops.optionalTraverse");

/**
 * Return the indicated property
 *
 * @param {any} obj
 * @param {string} key
 */
export async function property(obj, key) {
  if (obj == null) {
    throw new ReferenceError();
  }

  if (isUnpackable(obj)) {
    obj = await obj.unpack();
  } else if (typeof obj === "string") {
    obj = new String(obj);
  } else if (typeof obj === "number") {
    obj = new Number(obj);
  }

  if (key in obj) {
    // Object defines the property, get it
    let value = obj[key];
    // Is value an instance method? Copied from ObjectTree.
    const isInstanceMethod =
      !(obj instanceof Function) &&
      value instanceof Function &&
      !Object.hasOwn(obj, key);
    if (isInstanceMethod) {
      // Bind it to the object
      value = value.bind(obj);
    }
    return value;
  }

  // Handle as tree traversal
  return Tree.traverseOrThrow(obj, key);
}
addOpLabel(property, "«ops.property»");

export function remainder(a, b) {
  return a % b;
}
addOpLabel(remainder, "«ops.remainder»");

/**
 * Files tree for the filesystem root.
 */
export async function rootDirectory(...keys) {
  const tree = new OrigamiFiles("/");
  return keys.length > 0 ? Tree.traverse(tree, ...keys) : tree;
}
addOpLabel(rootDirectory, "«ops.rootDirectory»");

/**
 * Return the scope of the current tree
 *
 * @param {AsyncTree} parent
 */
export async function scope(parent) {
  if (!parent) {
    throw new ReferenceError(
      "Tried to find a value in scope, but no container was provided as the parent."
    );
  }
  return Tree.scope(parent);
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
  return Tree.indent(strings, ...values);
}
addOpLabel(templateIndent, "«ops.templateIndent»");

/**
 * Apply the tree tagged template function.
 */
export async function templateText(strings, ...values) {
  return Tree.text(strings, ...values);
}
addOpLabel(templateText, "«ops.templateText»");

/**
 * Emulate the JavaScript `typeof` operator
 *
 * Note the name is `typeOf` (uppercase "O"), as `typeof` is a reserved word
 *
 * @param {any} value
 */
export function typeOf(value) {
  return typeof value;
}
addOpLabel(typeOf, "«ops.typeOf»");

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

/**
 * Emulate JavaScript's rarely-used `void` operator
 *
 * @param {any} value
 */
export function voidOp(value) {
  return undefined;
}
addOpLabel(voidOp, "«ops.voidOp»");
