import { Scope } from "@weborigami/language";
import {
  inputsSymbol,
  outputSymbol,
  sourceSymbol,
} from "@weborigami/language/src/runtime/evaluate.js";
import { toString } from "../common/utilities.js";

export default function callTree(object) {
  if (object instanceof Scope) {
    // Skip
    return null;
  } else if (object[sourceSymbol] === undefined) {
    // Not an annotated result
    return normalize(object);
  }

  const source = object[sourceSymbol];
  const result = normalize(object);

  let inputs;
  if (!(object[inputsSymbol]?.[0] instanceof Scope)) {
    inputs = object[inputsSymbol]
      .map(callTree)
      .filter((input) => input !== null);
  }

  let output;
  if (object[outputSymbol]) {
    output = {
      source: object[outputSymbol][sourceSymbol],
    };
    if (!(object[outputSymbol][inputsSymbol]?.[0] instanceof Scope)) {
      output.inputs = object[outputSymbol][inputsSymbol].map(callTree);
    }
  }

  return Object.assign(
    {
      source,
      result,
    },
    inputs && { inputs },
    output && { output }
  );
}

function normalize(object) {
  let normalized = object.valueOf?.() ?? object;
  // HACKS
  if (normalized instanceof Buffer) {
    normalized = toString(normalized);
  } else if (normalized instanceof Function) {
    normalized = normalized.name;
  } else if (normalized instanceof Scope) {
    normalized = "[scope]";
  }
  return normalized;
}
