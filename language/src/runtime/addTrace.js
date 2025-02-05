import { box, isStringLike, scope, toString } from "@weborigami/async-tree";
import codeFragment from "./codeFragment.js";
import {
  codeSymbol,
  scopeSymbol,
  sourceSymbol,
  traceSymbol,
} from "./symbols.js";

export default function addTrace(context, code, intermediates, result) {
  if (typeof result === "symbol") {
    return result;
  }

  if (result) {
    result = box(result);
    try {
      if (!(sourceSymbol in result)) {
        Object.defineProperty(result, sourceSymbol, {
          get() {
            return code.location ? codeFragment(code.location) : null;
          },
          enumerable: false,
        });
      }
      if (!(codeSymbol in result)) {
        Object.defineProperty(result, codeSymbol, {
          value: code,
          enumerable: false,
        });
      }
      if (!(scopeSymbol in result)) {
        Object.defineProperty(result, scopeSymbol, {
          get() {
            return scope(context).trees;
          },
          enumerable: false,
        });
      }
      if (!(traceSymbol in result)) {
        Object.defineProperty(result, traceSymbol, {
          get() {
            return createTrace(result, code, intermediates);
          },
          enumerable: false,
        });
      }
    } catch (/** @type {any} */ error) {
      // Ignore errors.
    }
  }

  return result;
}

function createTrace(result, code, intermediateValues) {
  const value = format(result);
  const start = code.location.start.offset;
  const end = code.location.end.offset;
  const source = code.location.source;

  let intermediateTraces;
  if (intermediateValues) {
    intermediateValues.shift();
    intermediateTraces = intermediateValues.map((intermediate) => {
      const intermediateTrace = intermediate[traceSymbol];
      if (!intermediateTrace) {
        return {
          value: intermediate,
        };
      }

      const {
        value,
        source: intermediateSource,
        intermediates,
        start,
        end,
      } = intermediateTrace;
      const sameSourceAsParent = intermediateSource === source;

      return Object.assign(
        {
          value,
          start,
          end,
        },
        !sameSourceAsParent && { source: intermediateSource },
        intermediates && { intermediates }
      );
    });
  }

  return Object.assign(
    {
      value,
      start,
      end,
    },
    source && { source },
    intermediateTraces && { intermediates: intermediateTraces }
  );
}

function format(object) {
  if (typeof object === "number") {
    return object;
  } else if (object instanceof Number || object instanceof String) {
    return object.valueOf();
  } else if (isStringLike(object)) {
    return toString(object);
  } else if (object instanceof Function) {
    return Object.getOwnPropertyNames(object).includes("toString")
      ? object.toString()
      : object.name;
  } else {
    return object;
  }
}
