import * as ops from "../runtime/ops.js";

// Parser helpers

/**
 * If a parse result is an object that will be evaluated at runtime, attach the
 * location of the source code that produced it for debugging and error messages.
 */
export function annotate(parseResult, location) {
  if (typeof parseResult === "object" && parseResult !== null) {
    parseResult.location = location;
  }
  return parseResult;
}

// The indicated code is being used to define a property named by the given key.
// Rewrite any [ops.scope, key] calls to be [ops.inherited, key] to avoid
// infinite recursion.
function avoidRecursivePropertyCalls(code, key) {
  if (!(code instanceof Array)) {
    return code;
  }
  let modified;
  if (code[0] === ops.scope && code[1] === key) {
    // Rewrite to avoid recursion
    modified = [ops.inherited, key];
  } else {
    // Process any nested code
    modified = code.map((value) => avoidRecursivePropertyCalls(value, key));
  }
  // @ts-ignore
  modified.location = code.location;
  return modified;
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

function isWhitespace(char) {
  return char === " " || char === "\n" || char === "\r" || char === "\t";
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
 * @typedef {import("../../index.ts").Code} Code
 *
 * @param {Code} target
 * @param {Code[]} chain
 * @returns
 */
export function makeFunctionCall(target, chain, location) {
  if (!(target instanceof Array)) {
    const error = new SyntaxError(`Can't call this like a function: ${target}`);
    /** @type {any} */ (error).location = location;
    throw error;
  }

  let value = target;
  const source = target.location.source;
  // The chain is an array of arguments (which are themselves arrays). We
  // successively apply the top-level elements of that chain to build up the
  // function composition.
  let start = target.location.start;
  let end = target.location.end;
  for (const args of chain) {
    /** @type {Code} */
    let fnCall;

    // @ts-ignore
    fnCall =
      args[0] !== ops.traverse
        ? // Function call
          [value, ...args]
        : args.length > 1
        ? // Traverse
          [ops.traverse, value, ...args.slice(1)]
        : // Traverse without arguments equates to unpack
          [ops.unpack, value];

    // Create a location spanning the newly-constructed function call.
    if (args instanceof Array) {
      if (args.location) {
        end = args.location.end;
      } else {
        throw "Internal parser error: no location for function call argument";
      }
    }

    fnCall.location = { start, source, end };

    value = fnCall;
  }

  return value;
}

export function makeObject(entries, op) {
  let currentEntries = [];
  const spreads = [];

  for (let [key, value] of entries) {
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
      value[1][0] === ops.primitive
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
export function makePipeline(steps) {
  const [first, ...rest] = steps;
  let value = first;
  for (const args of rest) {
    value = [args, value];
  }
  return value;
}

// Define a property on an object.
export function makeProperty(key, value) {
  const modified = avoidRecursivePropertyCalls(value, key);
  return [key, modified];
}

export function makeTemplate(parts) {
  // Drop empty/null strings.
  const filtered = parts.filter((part) => part);
  const trimmed = filtered.map((part) => trimTemplatePart(part));
  // const trimmed = filtered;

  // Return a concatenation of the parts. If there are no parts, return the
  // empty string. If there's just one string, return that directly.
  return trimmed.length === 0
    ? ""
    : trimmed.length === 1 &&
      trimmed[0][0] === ops.primitive &&
      typeof trimmed[0][1] === "string"
    ? trimmed[0]
    : [ops.concat, ...trimmed];
}

function trimTemplatePart(part) {
  if (part[0] !== ops.primitive || typeof part[1] !== "string") {
    // Not a string
    return part;
  }

  let text = part[1]
    // Remove trailing spaces or tabs on the last line
    .replace(/\n[ \t]+$/, "\n")
    // Remove a leading newline
    .replace(/^\n/, "");

  const trimmed = [ops.primitive, text];
  /** @type {Code} */ (trimmed).location = part.location;
  return trimmed;
}
