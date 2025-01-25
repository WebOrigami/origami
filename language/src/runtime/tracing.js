import { box, isStringLike, scope, toString } from "@weborigami/async-tree";
import { isPrimitive } from "@weborigami/async-tree/src/utilities.js";
import codeFragment from "./codeFragment.js";
import {
  codeSymbol,
  scopeSymbol,
  sourceSymbol,
  traceSymbol,
} from "./symbols.js";

export default function tracing(context, code, evaluation, result) {
  if (result == null || typeof result === "symbol") {
    return result;
  }

  let call = null;
  if (result[traceSymbol]) {
    // Function call
    call = result[traceSymbol];
  }

  result = box(result);
  try {
    Object.defineProperty(result, codeSymbol, {
      configurable: true,
      value: code,
      enumerable: false,
    });
    Object.defineProperty(result, scopeSymbol, {
      configurable: true,
      get() {
        return scope(context).trees;
      },
      enumerable: false,
    });
    Object.defineProperty(result, sourceSymbol, {
      configurable: true,
      get() {
        return code.location ? codeFragment(code.location) : null;
      },
      enumerable: false,
    });
    Object.defineProperty(result, traceSymbol, {
      configurable: true,
      get() {
        const source = code.location ? codeFragment(code.location) : null;
        const url = code.location?.source?.url;
        return Object.assign(
          {
            value: result.valueOf?.() ?? result,
            source,
            url,
            evaluation: evaluation.map(format),
          },
          call && {
            call,
          }
        );
      },
      enumerable: false,
    });
  } catch (/** @type {any} */ error) {
    // Ignore errors.
  }

  return result;
}

function format(object) {
  if (object[traceSymbol]) {
    return object[traceSymbol];
  } else if (isPrimitive(object)) {
    return object;
  } else if (object instanceof Number || object instanceof String) {
    return object.valueOf();
  } else if (isStringLike(object)) {
    return toString(object);
  } else if (object instanceof Function) {
    // Ops have a toString method for a friendly name
    return Object.getOwnPropertyNames(object).includes("toString")
      ? object.toString()
      : object.name;
  } else {
    return object;
  }
}
