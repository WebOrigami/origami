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

// Markers in compiled output, will get optimized away
export const markers = {
  external: Symbol("external"), // External reference
  global: Symbol("global"), // Global reference
  paramArray: Symbol("paramArray"), // Parameter array destructuring
  paramInitializer: Symbol("paramInitializer"), // Parameter default value
  paramName: Symbol("paramName"), // Parameter name
  paramObject: Symbol("paramObject"), // Parameter object destructuring
  paramRest: Symbol("paramRest"), // Rest operator in parameters
  property: Symbol("property"), // Property access
  reference: Symbol("reference"), // Reference to local, scope, or global
  spread: Symbol("spread"), // Spread operator
  traverse: Symbol("traverse"), // Path traversal
};

/**
 * If a parse result is an object that will be evaluated at runtime, attach the
 * location of the source code that produced it for debugging and error messages.
 *
 * @param {any[]} code
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
  // For `foo`, the call would be: [[markers.traverse, [markers.reference,  "foo"]], undefined]
  if (
    code[0] instanceof Array &&
    code[0][0] === markers.traverse &&
    code[0][1][0] === markers.reference &&
    code[0][1][1] === name
  ) {
    // Replace the call with the macro
    return annotate(macro, code.location);
  }

  const applied = code.map((child) => applyMacro(child, name, macro));
  return annotate(applied, code.location);
}

function checkDuplicateParamNames(flat) {
  const names = new Set();
  for (const binding of flat) {
    const paramName = binding[0];
    if (names.has(paramName)) {
      const error = new SyntaxError(`Duplicate parameter name "${paramName}"`);
      /** @type {any} */ (error).location = /** @type {any} */ (
        binding
      ).location;
      throw error;
    }
    names.add(paramName);
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
    if (Array.isArray(value) && value[0] === markers.spread) {
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

  if (spreads.length === 0) {
    // No spreads, simple array
    return annotate([ops.array, ...currentEntries], location);
  }

  // Finish any current entries, add to spreads
  if (currentEntries.length > 0) {
    spreads.push([ops.array, ...currentEntries]);
    currentEntries = [];
  }

  // We don't optimize for the single-spread case here because the object
  // being spread might be a tree and we want ops.flat to handle that.
  return annotate([ops.flat, ...spreads], location);
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
    instanceof: ops.instanceOf,
    in: ops.inOperator,
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
export function makeCall(target, args, location) {
  if (!(target instanceof Array)) {
    const error = new SyntaxError(`Can't call this like a function: ${target}`);
    /** @type {any} */ (error).location = /** @type {any} */ (target).location;
    throw error;
  }

  let fnCall;
  const op = args[0];
  switch (op) {
    case markers.property:
      // Property access
      const property = args[1];
      fnCall = [ops.property, target, property];
      break;

    case ops.templateText:
      // Tagged template
      const strings = args[1];
      const values = args.slice(2);
      fnCall = makeTaggedTemplateCall(target, strings, ...values);
      break;

    case markers.traverse:
      // Traverse
      const keys = args.slice(1);
      fnCall = [target, ...keys];
      break;

    default:
      // Function call with explicit or implicit parentheses
      fnCall = makePossibleSpreadCall(target, args, location);
      break;
  }

  return annotate(fnCall, location);
}

/**
 * Create a chain of function calls, property accesses, or traversals.
 *
 * @param {AnnotatedCode} target
 * @param {AnnotatedCode[]} chain
 * @param {CodeLocation} location
 */
export function makeCallChain(target, chain, location) {
  let result = target;
  let args = chain.shift();
  while (args) {
    const op = args[0];
    if (op === ops.optional) {
      // Optional chaining short-circuits the rest of the call chain
      const optionalChain = [args[1], ...chain];
      return makeOptionalCall(result, optionalChain, location);
    } else {
      // Extend normal call chain
      result = makeCall(result, args, location);
    }
    args = chain.shift();
  }
  return result;
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
    const params = annotate([], arg.location);
    return makeLambda(params, arg, arg.location);
  });
}

export function makeDocument(front, body, location) {
  // In order for template expressions to see the front matter properties,
  // we translate the top-level front properties to object entries.
  const entries = Object.entries(front).map(([key, value]) =>
    annotate([key, annotate([ops.literal, value], location)], location)
  );

  // Add an entry for the body
  entries.push(annotate(["_body", body], location));

  // Return the code for the document object
  return annotate([ops.object, ...entries], location);
}

/**
 * Create a lambda function with the given parameters.
 *
 * @param {AnnotatedCode} parameters
 * @param {AnnotatedCode} body
 * @param {CodeLocation} location
 */
export function makeLambda(parameters, body, location) {
  // Create a reference that at runtime resolves to parameters array. All
  // parameter references will use this as their basis.
  const reference = annotate([ops.params, 0], location);
  const bindings = makeParamArray(parameters, reference);
  const annotatedBindings = annotate(bindings, parameters.location);
  return annotate([ops.lambda, annotatedBindings, body], location);
}

/**
 * From the given spreads within an object spread, return the merge.
 *
 * Example:
 *
 *      {
 *        x = { a: 1 }
 *        ...x
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
 *          ...x
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
        const parent = annotate([ops.inherited, 1], entry.location);
        const reference = annotate([parent, key], entry.location);
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
    if (key === markers.spread) {
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
    // Spreading a single reference equates to an unpack
    if (spreads[0][0] === markers.traverse) {
      code = annotate([ops.unpack, spreads[0]], location);
    } else {
      code = spreads[0];
    }
  } else {
    // Empty object
    code = [ops.object];
  }

  return annotate(code, location);
}

/**
 * Make an optional call: if the target is null or undefined, return undefined;
 * otherwise, make the call.
 *
 * @param {AnnotatedCode} target
 * @param {AnnotatedCode[]} chain
 * @param {CodeLocation} location
 */
function makeOptionalCall(target, chain, location) {
  const optionalKey = "__optional__";
  // Create a reference to the __optional__ parameter
  const optionalReference = annotate(
    [markers.reference, optionalKey],
    location
  );
  const optionalTraverse = annotate(
    [markers.traverse, optionalReference],
    location
  );

  // Create the call body to be made if the target is not null/undefined
  const body = makeCallChain(optionalTraverse, chain, location);

  // Create a function that takes __optional__ and makes the call
  const optionalParam = annotate([markers.paramName, optionalKey], location);
  const params = annotate([optionalParam], location);
  const lambda = makeLambda(params, body, location);

  // Create the call to ops.optional
  const optionalCall = annotate([ops.optional, target, lambda], location);
  return optionalCall;
}

// Return bindings for the given parameter
function makeParam(parameter, reference) {
  const [marker, ...args] = parameter;
  switch (marker) {
    case markers.paramArray:
      return makeParamArray(args, reference);

    case markers.paramInitializer:
      const [baseParam, defaultValue] = args;
      const deferred = makeDeferredArguments([defaultValue])[0];
      const defaultReference = annotate(
        [ops.defaultValue, reference, deferred],
        parameter.location
      );
      return makeParam(baseParam, defaultReference);

    case markers.paramName:
      return makeParamName(parameter, reference);

    case markers.paramObject:
      return makeParamObject(args, reference);

    default:
      throw new Error(`Unknown parameter type: ${parameter[0]}`);
  }
}

// Return bindings for the array destructuring parameter
function makeParamArray(entries, reference) {
  const bindings = entries.map((entry, index) => {
    if (entry === undefined) {
      return []; // Skip missing entry
    } else if (entry[0] === markers.paramRest) {
      // Rest parameter
      const sliceFunction = annotate([reference, "slice"], entry.location);
      const sliceCall = annotate([sliceFunction, index], entry.location);
      return makeParam(entry[1], sliceCall);
    }
    // Other type of parameter
    const indexReference = annotate([reference, index], entry.location);
    return makeParam(entry, indexReference);
  });

  const flat = bindings.flat();
  checkDuplicateParamNames(flat);
  return flat;
}

// Return binding for a single parameter name
function makeParamName(parameter, reference) {
  const paramName = parameter[1];
  // Return as an array with one entry
  const bindings = [annotate([paramName, reference], parameter.location)];
  return bindings;
}

// Return bindings for an object destructuring parameter
function makeParamObject(entries, reference) {
  const keys = [];
  const bindings = entries.map((entry) => {
    if (entry[0] === markers.paramRest) {
      // Rest parameter; exclude keys we've seen so far
      const annotatedKeys = annotate([ops.array, ...keys], entry.location);
      const objectRest = annotate(
        [ops.objectRest, reference, annotatedKeys],
        entry.location
      );
      return makeParam(entry[1], objectRest);
    }
    const [key, binding] = entry;
    keys.push(key);
    const propertyValue = annotate([reference, key], entry.location);
    return makeParam(binding, propertyValue);
  });

  const flat = bindings.flat();
  checkDuplicateParamNames(flat);
  return flat;
}

/**
 * Handle a path with one or more segments separated by slashes.
 *
 * @param {AnnotatedCode} keys
 */
export function makePath(keys) {
  // Remove empty segments
  const args = keys.filter(
    (key, index) => index === 0 || (key[1] !== "" && key[1] !== "/")
  );

  // Upgrade head to a reference
  const [head, ...tail] = args;
  const headKey = head[1];
  const reference = annotate([markers.reference, headKey], head.location);

  let code = [markers.traverse, reference, ...tail];
  const location = spanLocations(code);
  code = annotate(code, location);

  return code;
}

/**
 * Make a pipline: similar to a function call, but the order is reversed.
 *
 * @param {AnnotatedCode} arg
 * @param {AnnotatedCode} fn
 */
export function makePipeline(arg, fn, location) {
  const result = makeCall(fn, [arg], location);
  const source = fn.location.source;
  let start = arg.location.start;
  let end = fn.location.end;
  return annotate(result, { start, source, end });
}

function makePossibleSpreadCall(target, args, location) {
  const hasSpread = args.some(
    (arg) => Array.isArray(arg) && arg[0] === markers.spread
  );
  if (!hasSpread) {
    // No spreads, simple call
    return [target, ...args];
  }

  // Get function's apply method
  const applyMethod = annotate([ops.property, target, "apply"], location);
  const wrappedArgs = args.map((arg) => {
    if (arg[0] === markers.spread) {
      return arg[1];
    } else {
      return annotate([ops.array, arg], arg.location);
    }
  });
  const flatCall = annotate([ops.flat, ...wrappedArgs], location);
  return [applyMethod, null, flatCall];
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
    await: null, // no-op
    typeof: ops.typeOf,
    void: ops.voidOp,
  };
  const op = operators[operator];
  return op ? annotate([op, value], location) : annotate(value, location);
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

// Create a locations that spans those in the array. This assumes the locations
// are in order and non-overlapping.
export function spanLocations(code) {
  const first = code.find((item) => item.location).location;
  const last = code[code.findLastIndex((item) => item.location)].location;
  return {
    source: first.source,
    start: first.start,
    end: last.end,
  };
}
