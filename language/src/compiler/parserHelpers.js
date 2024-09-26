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
      args[0] === ops.traverse
        ? [ops.traverse, value, ...args.slice(1)]
        : [value, ...args];

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
      if (currentEntries.length > 0) {
        spreads.push([op, ...currentEntries]);
        currentEntries = [];
      }
      spreads.push(value);
    } else {
      if (
        value instanceof Array &&
        value[0] === ops.getter &&
        value[1] instanceof Array &&
        value[1][0] === ops.primitive
      ) {
        // Simplify a getter for a primitive value to a regular property
        value = value[1];
      }
      currentEntries.push([key, value]);
    }
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

export function makeTemplate(parts) {
  // Drop empty/null strings.
  const filtered = parts.filter((part) => part);
  // Return a concatenation of the parts. If there are no parts, return the
  // empty string. If there's just one string, return that directly.
  return filtered.length === 0
    ? ""
    : filtered.length === 1 &&
      filtered[0][0] === ops.primitive &&
      typeof filtered[0][1] === "string"
    ? filtered[0]
    : [ops.concat, ...filtered];
}
