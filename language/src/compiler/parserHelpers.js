import * as ops from "../runtime/ops.js";

// Parser helpers

export function makeFunctionCall(target, chain) {
  let value = target;
  // The chain is an array of arguments (which are themselves arrays). We
  // successively apply the top-level elements of that chain to build up the
  // function composition.
  for (const args of chain) {
    if (args[0] === ops.traverse) {
      value = [ops.traverse, value, ...args.slice(1)];
    } else {
      value = [value, ...args];
    }
  }
  return value;
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
    : filtered.length === 1 && typeof filtered[0] === "string"
    ? filtered[0]
    : [ops.concat, ...filtered];
}
