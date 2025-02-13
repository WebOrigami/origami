import { box, scope } from "@weborigami/async-tree";
import codeFragment from "./codeFragment.js";
import { ops } from "./internal.js";
import { traceSymbol } from "./symbols.js";

/**
 * Add information to the result object (boxing it if necessary) to help with
 * debugging.
 *
 * @param {any} result
 * @param {import("@weborigami/types").AsyncTree|null} context
 * @param {import("../../index.ts").AnnotatedCode} code
 * @param {any[]} inputs
 * @returns
 */
export default function addDebuggingInfo(result, context, code, inputs) {
  if (
    result == null ||
    typeof result === "symbol" ||
    typeof result === "function"
  ) {
    return result;
  }

  if (typeof result !== "object") {
    result = box(result);
  } else if (!Object.isExtensible(result)) {
    // Can't add trace
    return result;
  } else if (code[0] === ops.literal) {
    // Don't trace literals
    return result;
  } else if (code[0] === ops.external) {
    // ops.external wraps ops.scope, no need to add more tracing info
    return result;
  }

  const args = inputs.slice(1);
  if (args.some((arg) => arg === result)) {
    // The function directly returned one of its arguments
    // TODO: Handle this case? For now we punt to avoid cycle
    return result;
  }

  const trace = {
    code,

    inputs,

    get scope() {
      return context ? scope(context).trees : null;
    },
  };

  if (code.location) {
    trace.expression = codeFragment(code.location);
  }

  if (traceSymbol in result) {
    // This is the result of a function call
    trace.call = result[traceSymbol];
  }

  Object.defineProperty(result, traceSymbol, {
    configurable: true,
    enumerable: false,
    value: trace,
    writable: true,
  });

  return result;
}
