import { trailingSlash } from "@weborigami/async-tree";
import * as YAMLModule from "yaml";
import codeFragment from "../runtime/codeFragment.js";
import * as ops from "../runtime/ops.js";

// The "yaml" package doesn't seem to provide a default export that the browser can
// recognize, so we have to handle two ways to accommodate Node and the browser.
// @ts-ignore
const YAML = YAMLModule.default ?? YAMLModule.YAML;

// Parser helpers

/** @typedef {import("../../index.ts").AnnotatedCode} AnnotatedCode */
/** @typedef {import("../../index.ts").AnnotatedCodeItem} AnnotatedCodeItem */
/** @typedef {import("../../index.ts").CodeLocation} CodeLocation */
/** @typedef {import("../../index.ts").Code} Code */

// Marker for a reference that may be a builtin or a scope reference
export const undetermined = Symbol("undetermined");

const builtinRegex = /^[A-Za-z][A-Za-z0-9]*$/;

/**
 * If a parse result is an object that will be evaluated at runtime, attach the
 * location of the source code that produced it for debugging and error messages.
 *
 * @param {Code[]} code
 * @param {CodeLocation} location
 */
export function annotate(code, location) {
  /** @type {AnnotatedCode} */
  // @ts-ignore - Need to add annotation below before type is correct
  const annotated = code.slice();
  annotated.location = location;
  annotated.source = codeFragment(location);
  return annotated;
}

/**
 * In the given code, replace all scope refernces to the given name with the
 * given macro code.
 *
 * @param {AnnotatedCode} code
 * @param {string} name
 * @param {AnnotatedCode} macro
 */
export function applyMacro(code, name, macro) {
  if (!(code instanceof Array)) {
    return code;
  }

  const [fn, ...args] = code;
  if (fn === ops.scope && args[0] === name) {
    return macro;
  }

  const applied = code.map((child) => applyMacro(child, name, macro));
  return annotate(applied, code.location);
}

/**
 * The indicated code is being used to define a property named by the given key.
 * Rewrite any [ops.scope, key] calls to be [ops.inherited, key] to avoid
 * infinite recursion.
 *
 * @param {AnnotatedCode} code
 * @param {string} key
 */
function avoidRecursivePropertyCalls(code, key) {
  if (!(code instanceof Array)) {
    return code;
  }
  /** @type {Code} */
  let modified;
  if (
    code[0] === ops.scope &&
    trailingSlash.remove(code[1]) === trailingSlash.remove(key)
  ) {
    // Rewrite to avoid recursion
    modified = [ops.inherited, code[1]];
  } else if (
    code[0] === ops.lambda &&
    code[1].some((param) => param[1] === key)
  ) {
    // Lambda that defines the key; don't rewrite
    return code;
  } else {
    // Process any nested code
    modified = code.map((value) => avoidRecursivePropertyCalls(value, key));
  }
  return annotate(modified, code.location);
}

/**
 * Downgrade a potential builtin reference to a scope reference.
 *
 * @param {AnnotatedCode} code
 */
export function downgradeReference(code) {
  if (code && code.length === 2 && code[0] === undetermined) {
    return annotate([ops.scope, code[1]], code.location);
  } else {
    return code;
  }
}

/**
 * Create an array
 *
 * @param {AnnotatedCode[]} entries
 * @param {CodeLocation} location
 */
export function makeArray(entries, location) {
  let currentEntries = [];
  const spreads = [];

  for (const value of entries) {
    if (Array.isArray(value) && value[0] === ops.spread) {
      if (currentEntries.length > 0) {
        const location = { ...currentEntries[0].location };
        location.end = currentEntries[currentEntries.length - 1].location.end;
        /** @type {AnnotatedCodeItem} */
        const fn = ops.array;
        const spread = annotate([fn, ...currentEntries], location);
        spreads.push(spread);
        currentEntries = [];
      }
      spreads.push(...value.slice(1));
    } else {
      currentEntries.push(value);
    }
  }

  // Finish any current entries.
  if (currentEntries.length > 0) {
    spreads.push([ops.array, ...currentEntries]);
    currentEntries = [];
  }

  let result;
  if (spreads.length > 1) {
    result = [ops.merge, ...spreads];
  } else if (spreads.length === 1) {
    result = spreads[0];
  } else {
    result = [ops.array];
  }

  return annotate(result, location);
}

/**
 * Create a chain of binary operators. The head is the first value, and the tail
 * is a [operator, value] pair as an array.
 *
 * @param {AnnotatedCode} left
 * @param {[token: any, right: AnnotatedCode]} tail
 */
export function makeBinaryOperation(left, [operatorToken, right]) {
  const operators = {
    "!=": ops.notEqual,
    "!==": ops.notStrictEqual,
    "%": ops.remainder,
    "&": ops.bitwiseAnd,
    "*": ops.multiplication,
    "**": ops.exponentiation,
    "+": ops.addition,
    "-": ops.subtraction,
    "/": ops.division,
    "<": ops.lessThan,
    "<<": ops.shiftLeft,
    "<=": ops.lessThanOrEqual,
    "==": ops.equal,
    "===": ops.strictEqual,
    ">": ops.greaterThan,
    ">=": ops.greaterThanOrEqual,
    ">>": ops.shiftRightSigned,
    ">>>": ops.shiftRightUnsigned,
    "^": ops.bitwiseXor,
    "|": ops.bitwiseOr,
  };
  const op = operators[operatorToken];

  const location = {
    source: left.location.source,
    start: left.location.start,
    end: right.location.end,
  };

  return annotate([op, left, right], location);
}

/**
 * Create a function call.
 *
 * @param {AnnotatedCode} target
 * @param {any[]} args
 */
export function makeCall(target, args) {
  if (!(target instanceof Array)) {
    const error = new SyntaxError(`Can't call this like a function: ${target}`);
    /** @type {any} */ (error).location = /** @type {any} */ (target).location;
    throw error;
  }

  let fnCall;
  if (args[0] === ops.traverse) {
    let tree = target;

    if (tree[0] === undetermined) {
      // In a traversal, downgrade ops.builtin references to ops.scope
      tree = downgradeReference(tree);
      if (tree[0] === ops.scope && !trailingSlash.has(tree[1])) {
        // Target didn't parse with a trailing slash; add one
        tree[1] = trailingSlash.add(tree[1]);
      }
    }

    if (args.length > 1) {
      // Regular traverse
      const keys = args.slice(1);
      fnCall = [ops.traverse, tree, ...keys];
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
  const location = { ...target.location };
  if (args instanceof Array) {
    let end;
    if ("location" in args) {
      end = /** @type {any} */ (args).location.end;
    } else if ("location" in args.at(-1)) {
      end = args.at(-1).location.end;
    }
    if (end === undefined) {
      throw "Internal parser error: no location for function call argument";
    }
    location.end = end;
  }

  return annotate(fnCall, location);
}

/**
 * For functions that short-circuit arguments, we need to defer evaluation of
 * the arguments until the function is called. Exception: if the argument is a
 * literal, we leave it alone.
 *
 * @param {AnnotatedCode[]} args
 */
export function makeDeferredArguments(args) {
  return args.map((arg) => {
    if (arg instanceof Array && arg[0] === ops.literal) {
      return arg;
    }
    const lambdaParameters = annotate([], arg.location);
    /** @type {AnnotatedCodeItem} */
    const fn = [ops.lambda, lambdaParameters, arg];
    return annotate(fn, arg.location);
  });
}

/**
 * Make an object.
 *
 * @param {AnnotatedCode[]} entries
 * @param {CodeLocation} location
 */
export function makeObject(entries, location) {
  let currentEntries = [];
  const spreads = [];

  for (let entry of entries) {
    const [key, value] = entry;
    if (key === ops.spread) {
      if (value[0] === ops.object) {
        // Spread of an object; fold into current object
        currentEntries.push(...value.slice(1));
      } else {
        // Spread of a tree; accumulate
        if (currentEntries.length > 0) {
          const location = { ...currentEntries[0].location };
          location.end = currentEntries[currentEntries.length - 1].location.end;
          const spread = annotate([ops.object, ...currentEntries], location);
          spreads.push(spread);
          currentEntries = [];
        }
        spreads.push(value);
      }
      continue;
    }

    if (value instanceof Array) {
      if (
        value[0] === ops.getter &&
        value[1] instanceof Array &&
        value[1][0] === ops.literal
      ) {
        // Optimize a getter for a primitive value to a regular property
        entry = annotate([key, value[1]], entry.location);
      }
    }

    currentEntries.push(entry);
  }

  // Finish any current entries.
  if (currentEntries.length > 0) {
    const location = { ...currentEntries[0].location };
    location.end = currentEntries[currentEntries.length - 1].location.end;
    const spread = annotate([ops.object, ...currentEntries], location);
    spreads.push(spread);
    currentEntries = [];
  }

  let code;
  if (spreads.length > 1) {
    // Merge multiple spreads
    code = [ops.merge, ...spreads];
  } else if (spreads.length === 1) {
    // A single spread can just be the object
    code = spreads[0];
  } else {
    // Empty object
    code = [ops.object];
  }

  return annotate(code, location);
}

/**
 * Make a pipline: similar to a function call, but the order is reversed.
 *
 * @param {AnnotatedCode} arg
 * @param {AnnotatedCode} fn
 */
export function makePipeline(arg, fn) {
  const upgraded = upgradeReference(fn);
  const result = makeCall(upgraded, [arg]);
  const source = fn.location.source;
  let start = arg.location.start;
  let end = fn.location.end;
  return annotate(result, { start, source, end });
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
      : undetermined;
  } else {
    op = ops.scope;
  }
  return [op, identifier];
}

/**
 * Make a template
 *
 * @param {any} op
 * @param {AnnotatedCode} head
 * @param {AnnotatedCode} tail
 * @param {CodeLocation} location
 */
export function makeTemplate(op, head, tail, location) {
  const strings = [head[1]];
  const values = [];
  for (const [value, literal] of tail) {
    const concat = annotate([ops.concat, value], value.location);
    values.push(concat);
    strings.push(literal[1]);
  }
  const stringsCode = annotate(strings, location);
  /** @type {AnnotatedCodeItem} */
  const fn = ops.literal;
  const literalCode = annotate([fn, stringsCode], location);
  return annotate([op, literalCode, ...values], location);
}

/**
 * Make a unary operation.
 *
 * @param {AnnotatedCode} operator
 * @param {AnnotatedCode} value
 * @param {CodeLocation} location
 */
export function makeUnaryOperation(operator, value, location) {
  const operators = {
    "!": ops.logicalNot,
    "+": ops.unaryPlus,
    "-": ops.unaryMinus,
    "~": ops.bitwiseNot,
  };
  return annotate([operators[operator], value], location);
}

/**
 * Make an object from YAML front matter
 *
 * @param {string} text
 * @param {CodeLocation} location
 */
export function makeYamlObject(text, location) {
  const parsed = YAML.parse(text);
  return annotate([ops.literal, parsed], location);
}

/**
 * Upgrade a potential builtin reference to an actual builtin reference.
 *
 * @param {AnnotatedCode} code
 */
export function upgradeReference(code) {
  if (code.length === 2 && code[0] === undetermined) {
    const result = [ops.builtin, code[1]];
    return annotate(result, code.location);
  } else {
    return code;
  }
}
