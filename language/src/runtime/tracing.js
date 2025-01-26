import {
  box,
  isPrimitive,
  isStringLike,
  scope,
  toString,
  Tree,
} from "@weborigami/async-tree";
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
        const expression = code.location ? codeFragment(code.location) : null;
        const url = code.location?.source?.url;
        return Object.assign(
          {
            result: format(result),
            expression,
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
  if (object == null) {
    return object;
  } else if (isStringLike(object)) {
    const text = toString(object);
    return text.length > 255 ? text.slice(0, 255) + "..." : text;
  } else if (isPrimitive(object)) {
    return object;
  } else if (object instanceof Number || object instanceof String) {
    return object.valueOf();
  } else if (object instanceof Function) {
    return object.name;
  } else if (Tree.isTreelike(object)) {
    return "...";
  } else if (object[traceSymbol]) {
    return object[traceSymbol];
  } else {
    return object;
  }
}
