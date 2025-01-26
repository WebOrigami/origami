import {
  box,
  isPlainObject,
  isPrimitive,
  isStringLike,
  scope,
  toString,
  Tree,
} from "@weborigami/async-tree";
import codeFragment from "./codeFragment.js";
import { ops } from "./internal.js";
import {
  callSymbol,
  codeSymbol,
  evaluationSymbol,
  scopeSymbol,
  sourceSymbol,
  traceSymbol,
} from "./symbols.js";

export default function tracing(context, code, evaluation, result) {
  if (result == null || typeof result === "symbol") {
    return result;
  }
  if (code[0] === ops.literal) {
    return result;
  }

  result = box(result);
  try {
    if (traceSymbol in result) {
      // Move trace symbol to call
      Object.defineProperty(result, callSymbol, {
        configurable: true,
        enumerable: false,
        value: result[traceSymbol],
      });
    }
    Object.defineProperty(result, codeSymbol, {
      configurable: true,
      enumerable: false,
      value: code,
    });
    Object.defineProperty(result, evaluationSymbol, {
      configurable: true,
      enumerable: false,
      value: evaluation,
    });
    Object.defineProperty(result, scopeSymbol, {
      configurable: true,
      enumerable: false,
      get() {
        return scope(context).trees;
      },
    });
    Object.defineProperty(result, sourceSymbol, {
      configurable: true,
      enumerable: false,
      get() {
        return code.location ? codeFragment(code.location) : null;
      },
    });
    Object.defineProperty(result, traceSymbol, {
      configurable: true,
      enumerable: false,
      get() {
        return traceInfo(result);
      },
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
  } else if (Tree.isAsyncTree(object)) {
    return "...";
  } else if (isPlainObject(object)) {
    return object;
  } else if (object instanceof Array) {
    return formatArray(object);
  } else {
    return object;
  }
}

function formatArray(array) {
  return array.map((entry) =>
    typeof entry === "object" &&
    !Tree.isAsyncTree(entry) &&
    traceSymbol in entry
      ? traceInfo(entry)
      : format(entry)
  );
}

function traceInfo(result) {
  const code = result[codeSymbol];
  const expression = code?.location ? codeFragment(code.location) : null;
  const url = code?.location?.source?.url;
  const evaluation = result[evaluationSymbol]
    ? formatArray(result[evaluationSymbol])
    : null;
  const call = callSymbol in result ? traceInfo(result[callSymbol]) : null;

  return Object.assign(
    {
      result: format(result),
      expression,
      url,
    },
    evaluation && {
      evaluation,
    },
    call && {
      call,
    }
  );
}
