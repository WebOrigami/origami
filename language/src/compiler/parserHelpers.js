import { trailingSlash } from "@weborigami/async-tree";
import codeFragment from "../runtime/codeFragment.js";
import * as ops from "../runtime/ops.js";

// Parser helpers

/** @typedef {import("../../index.ts").Code} Code */

export const provisionalScope = Symbol("provisionalScope");
const builtinRegex = /^[A-Za-z][A-Za-z0-9]*$/;

/**
 * If a parse result is an object that will be evaluated at runtime, attach the
 * location of the source code that produced it for debugging and error messages.
 *
 * @param {Code} code
 * @param {any} location
 */
export function annotate(code, location) {
  if (typeof code === "object" && code !== null && location) {
    code.location = location;
    code.source = codeFragment(location);
  }
  return code;
}

/**
 * The indicated code is being used to define a property named by the given key.
 * Rewrite any [ops.scope, key] calls to be [ops.inherited, key] to avoid
 * infinite recursion.
 *
 * @param {} code
 * @param {string} key
 */
function avoidRecursivePropertyCalls(code, key) {
  if (!(code instanceof Array)) {
    return code;
  }
  let modified;
  if (
    code[0] === ops.scope &&
    trailingSlash.remove(code[1]) === trailingSlash.remove(key)
  ) {
    // Rewrite to avoid recursion
    modified = [ops.inherited, code[1]];
  } else if (code[0] === ops.lambda && code[1].includes(key)) {
    // Lambda that defines the key; don't rewrite
    return code;
  } else {
    // Process any nested code
    modified = code.map((value) => avoidRecursivePropertyCalls(value, key));
  }
  annotate(modified, code.location);
  return modified;
}

/**
 * Downgrade a potential builtin reference to a scope reference.
 *
 * @param {Code} code
 * @returns {Code}
 */
export function downgradeReference(code) {
  if (code && code.length === 2 && code[0] === provisionalScope) {
    const result = [ops.scope, code[1]];
    annotate(result, code.location);
    return result;
  } else {
    return code;
  }
}

// Return true if the code will generate an async object.
function isCodeForAsyncObject(code) {
  if (!(code instanceof Array)) {
    return false;
  }
  if (code[0] !== ops.object) {
    return false;
  }
  // Are any of the properties getters?
  const entries = code.slice(1);
  const hasGetter = entries.some(([key, value]) => {
    return value instanceof Array && value[0] === ops.getter;
  });
  return hasGetter;
}

export function makeArray(entries) {
  let currentEntries = [];
  const spreads = [];

  for (const value of entries) {
    if (Array.isArray(value) && value[0] === ops.spread) {
      if (currentEntries.length > 0) {
        spreads.push([ops.array, ...currentEntries]);
        currentEntries = [];
      }
      const values = value.slice(1).map((x) => downgradeReference(x));
      spreads.push(...values);
    } else {
      currentEntries.push(downgradeReference(value));
    }
  }

  // Finish any current entries.
  if (currentEntries.length > 0) {
    spreads.push([ops.array, ...currentEntries]);
    currentEntries = [];
  }

  if (spreads.length > 1) {
    return [ops.merge, ...spreads];
  }
  if (spreads.length === 1) {
    return spreads[0];
  } else {
    return [ops.array];
  }
}

/**
 * Create a chain of binary operators. The head is the first value, and the tail
 * is an array of [operator, value] pairs.
 *
 * @param {Code} head
 * @param {[any, Code][]} tail
 */
export function makeBinaryOperatorChain(head, tail) {
  /** @type {Code} */
  let value = downgradeReference(head);
  for (const [operatorToken, right] of tail) {
    const left = value;
    const operators = {
      "===": ops.strictEqual,
      "!==": ops.notStrictEqual,
      "==": ops.equal,
      "!=": ops.notEqual,
    };
    const op = operators[operatorToken];
    // @ts-ignore
    value = [op, left, downgradeReference(right)];
    value.location = {
      source: left.location.source,
      start: left.location.start,
      end: right.location.end,
    };
  }
  return value;
}

/**
 * For functions that short-circuit arguments, we need to defer evaluation of
 * the arguments until the function is called. Exception: if the argument is a
 * literal, we leave it alone.
 *
 * @param {any[]} args
 */
export function makeDeferredArguments(args) {
  return args.map((arg) => {
    if (arg instanceof Array && arg[0] === ops.literal) {
      return arg;
    }
    arg = downgradeReference(arg);
    const fn = [ops.lambda, [], arg];
    annotate(fn, arg.location);
    return fn;
  });
}

/**
 * @param {Code} target
 * @param {any[]} args
 */
export function makeFunctionCall(target, args) {
  if (!(target instanceof Array)) {
    const error = new SyntaxError(`Can't call this like a function: ${target}`);
    /** @type {any} */ (error).location = target.location;
    throw error;
  }

  const source = target.location.source;
  let start = target.location.start;
  let end = target.location.end;

  args = annotate(
    args.map((arg) => downgradeReference(arg)),
    args.location
  );

  let fnCall;
  if (args[0] === ops.traverse) {
    // In a traversal, downgrade ops.builtin references to ops.scope
    let tree = downgradeReference(target);
    if (args.length > 1) {
      // Regular traverse
      fnCall = [ops.traverse, tree, ...args.slice(1)];
    } else {
      // Traverse without arguments equates to unpack
      fnCall = [ops.unpack, tree];
    }
  } else if (args[0] === ops.template) {
    // Tagged template
    fnCall = [upgradeReference(target), ...args.slice(1)];
  } else {
    // Function call with explicit or implicit parentheses
    fnCall = [upgradeReference(target), ...args];
  }

  // Create a location spanning the newly-constructed function call.
  if (args instanceof Array) {
    end = args.location?.end ?? args.at(-1)?.location?.end;
    if (end === undefined) {
      throw "Internal parser error: no location for function call argument";
    }
  }

  annotate(fnCall, { start, source, end });

  return fnCall;
}

export function makeObject(entries, op) {
  let currentEntries = [];
  const spreads = [];

  for (let [key, value] of entries) {
    value = downgradeReference(value);
    if (key === ops.spread) {
      // Spread entry; accumulate
      if (currentEntries.length > 0) {
        spreads.push([op, ...currentEntries]);
        currentEntries = [];
      }
      spreads.push(value);
      continue;
    }

    if (
      value instanceof Array &&
      value[0] === ops.getter &&
      value[1] instanceof Array &&
      value[1][0] === ops.literal
    ) {
      // Simplify a getter for a primitive value to a regular property
      value = value[1];
    } else if (isCodeForAsyncObject(value)) {
      // Add a trailing slash to key to indicate value is a subtree
      key = key + "/";
    }

    currentEntries.push([key, value]);
  }

  // Finish any current entries.
  if (currentEntries.length > 0) {
    spreads.push([op, ...currentEntries]);
    currentEntries = [];
  }

  if (spreads.length > 1) {
    return [ops.merge, ...spreads];
  }
  if (spreads.length === 1) {
    return spreads[0];
  } else {
    return [op];
  }
}

// Similar to a function call, but the order is reversed.
export function makePipeline(arg, fn) {
  const upgraded = upgradeReference(fn);
  const result = makeFunctionCall(upgraded, [arg]);
  const source = fn.location.source;
  let start = arg.location.start;
  let end = fn.location.end;
  annotate(result, { start, source, end });
  return result;
}

// Define a property on an object.
export function makeProperty(key, value) {
  const modified = avoidRecursivePropertyCalls(value, key);
  return [key, modified];
}

export function makeReference(identifier) {
  // We can't know for sure that an identifier is a builtin reference until we
  // see whether it's being called as a function.
  let op;
  if (builtinRegex.test(identifier)) {
    op = identifier.endsWith(":")
      ? // Namespace is always a builtin reference
        ops.builtin
      : provisionalScope;
  } else {
    op = ops.scope;
  }
  return [op, identifier];
}

export function makeTemplate(op, head, tail) {
  const strings = [head];
  const values = [];
  for (const [value, string] of tail) {
    values.push([ops.concat, downgradeReference(value)]);
    strings.push(string);
  }
  return [op, [ops.literal, strings], ...values];
}

/**
 * Upgrade a potential builtin reference to an actual builtin reference.
 *
 * @param {Code} code
 * @returns {Code}
 */
export function upgradeReference(code) {
  if (code.length === 2 && code[0] === provisionalScope) {
    const result = [ops.builtin, code[1]];
    annotate(result, code.location);
    return result;
  } else {
    return code;
  }
}
