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

// Marker for a continuation of a path traversal
export const traversal = Symbol("traversal");

// Marker for a reference that may be a local, scope, or global reference
export const reference = Symbol("reference");

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
 * In the given code, replace all function calls to the given name with the
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

  // We're looking for a function call with the given name.
  // For `foo`, the call would be: [[reference, [ops.literal, "foo"]], undefined]
  if (
    code[0] &&
    code[0][0] === reference &&
    code[0][1] instanceof Array &&
    code[0][1][0] === ops.literal &&
    code[0][1][1] === name &&
    code[1] === undefined
  ) {
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
    code[0] instanceof Array &&
    code[0][0] === ops.scope &&
    trailingSlash.remove(code[1][1]) === trailingSlash.remove(key)
  ) {
    // Rewrite to avoid recursion
    modified = [ops.inherited, code[1][1]];
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
 * Downgrade a potential global reference to a reference.
 *
 * @param {AnnotatedCode} code
 */
export function downgradeReference(code) {
  if (code && code.length === 2 && code[0] === reference) {
    return annotate([reference, code[1]], code.location);
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
    result = [ops.flat, ...spreads];
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
  const op = args[0];
  if (op === traversal || op === ops.optionalTraverse) {
    let tree = target;

    if (tree[0] === reference && !trailingSlash.has(tree[1][1])) {
      // Target didn't parse with a trailing slash; add one
      tree[1][1] = trailingSlash.add(tree[1][1]);
    }

    // Is the target an existing traversal that can be extended?
    const extend =
      tree[0] === reference ||
      (tree[0] instanceof Array && tree[0][0] === ops.global);
    if (extend) {
      fnCall = tree;
      // If last key doesn't end with slash, add one
      const last = tree.at(-1);
      if (last instanceof Array && last[0] === ops.literal) {
        last[1] = trailingSlash.add(last[1]);
      }
    } else {
      fnCall = [tree];
    }

    if (args.length > 1) {
      // Regular traverse
      const keys = args.slice(1);
      fnCall.push(...keys);
    } else if (tree[0] !== ops.rootDirectory) {
      // Traverse without arguments equates to unpack
      fnCall = [ops.unpack, tree];
    } else {
      fnCall = tree;
    }
  } else if (op === ops.templateStandard || op === ops.templateTree) {
    // Tagged template
    const strings = args[1];
    const values = args.slice(2);
    fnCall = makeTaggedTemplateCall(
      upgradeReference(target),
      strings,
      ...values
    );
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

export function makeDocument(mode, front, body, location) {
  // In order for template expressions to see the front matter properties,
  // we translate the top-level front properties to object entries.
  const entries = Object.entries(front).map(([key, value]) =>
    annotate([key, annotate([ops.literal, value], location)], location)
  );

  // Add an entry for the body
  const bodyKey = mode === "jse" ? "_body" : "@text";
  entries.push(annotate([bodyKey, body], location));

  // Return the code for the document object
  return annotate([ops.object, ...entries], location);
}

export function makeJsPropertyAccess(expression, property) {
  const location = {
    source: expression.location.source,
    start: expression.location.start,
    end: property.location.end,
  };
  return annotate([expression, property], location);
}

/**
 * From the given spreads within an object spread, return the merge.
 *
 * Example:
 *
 *      {
 *        x = { a: 1 }
 *        …x
 *        y = x
 *      }
 *
 *  will be treated as:
 *
 *      {
 *        x = { a: 1 }
 *        y = x
 *        _result: {
 *          x
 *          …x
 *          y
 *        }
 *      }.result
 *
 * @param {*} spreads
 * @param {CodeLocation} location
 */
function makeMerge(spreads, location) {
  const topEntries = [];
  const resultEntries = [];
  for (const spread of spreads) {
    if (spread[0] === ops.object) {
      topEntries.push(...spread.slice(1));
      // Also add an object to the result with indirect references
      const indirectEntries = spread.slice(1).map((entry) => {
        const [key] = entry;
        const context = annotate([ops.context, 1], entry.location);
        const reference = annotate([context, key], entry.location);
        const getter = annotate([ops.getter, reference], entry.location);
        return annotate([key, getter], entry.location);
      });
      const indirectObject = annotate(
        [ops.object, ...indirectEntries],
        location
      );
      resultEntries.push(indirectObject);
    } else {
      resultEntries.push(spread);
    }
  }

  // Merge to create result
  const result = annotate([ops.merge, ...resultEntries], location);

  // Add the result to the top-level object as _result
  topEntries.push(annotate(["_result", result], location));

  // Construct the top-level object
  const topObject = annotate([ops.object, ...topEntries], location);

  // Get the _result property
  const code = annotate([topObject, "_result"], location);
  return code;
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
    code = makeMerge(spreads, location);
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

/**
 * Make a tagged template call
 *
 * Because the tagged template function may not be an Origami function, we wrap
 * each argument in a ops.concat call to convert it to a string.
 *
 * @param {AnnotatedCode} fn
 * @param {AnnotatedCode} strings
 * @param {AnnotatedCode[]} values
 */
function makeTaggedTemplateCall(fn, strings, ...values) {
  const args = values.map((value) =>
    // @ts-ignore
    annotate([ops.concat, value], value.location)
  );
  return annotate([fn, strings, ...args], strings.location);
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
    values.push(value);
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
  // Account for the "---" delimiter at the beginning of the YAML front matter
  const yamlLineDelta = 1;
  const yamlOffsetDelta = 4; // 3 dashes + 1 newline

  let parsed;
  try {
    parsed = YAML.parse(text);
  } catch (/** @type {any} */ yamlError) {
    // Convert YAML error to a SyntaxError

    let { message } = yamlError;
    // Remove the line number and column if present
    const lineNumberRegex = /( at line )(\d+)(,)/;
    const lineNumberMatch = message.match(lineNumberRegex);
    if (lineNumberMatch) {
      message = message.slice(0, lineNumberMatch.index);
    }

    /** @type {any} */
    const error = new SyntaxError(message);
    error.location = {
      end: {
        column: yamlError.linePos[1].col,
        line: yamlError.linePos[1].line + yamlLineDelta,
        offset: yamlError.pos[1] + yamlOffsetDelta,
      },
      source: location.source,
      start: {
        column: yamlError.linePos[0].col,
        line: yamlError.linePos[0].line + yamlLineDelta,
        offset: yamlError.pos[0] + yamlOffsetDelta,
      },
    };
    throw error;
  }

  if (!(parsed instanceof Object)) {
    /** @type {any} */
    const error = new SyntaxError("YAML front matter must be an object.");
    error.location = location;
    throw error;
  }

  return parsed;
}

/**
 * Upgrade a potential builtin reference to an actual builtin reference.
 *
 * @param {AnnotatedCode} code
 */
export function upgradeReference(code) {
  if (
    code.length === 2 &&
    code[0] === reference &&
    builtinRegex.exec(code[1][1])
  ) {
    const result = [ops.global, code[1][1]];
    return annotate(result, code.location);
  } else {
    return code;
  }
}
