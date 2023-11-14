import * as ops from "../runtime/ops.js";

// Parser helpers

export function makeFunctionCall(target, chain) {
  let value = target;
  // The chain is an array of arguments (which are themselves arrays). We
  // successively apply the top-level elements of that chain to build up the
  // function composition.
  for (const args of chain) {
    value = [value, ...args];
  }
  return value;
}

export function makeObject(entries) {
  const object = {};
  for (const entry of entries) {
    Object.assign(object, entry);
  }
  return object;
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
