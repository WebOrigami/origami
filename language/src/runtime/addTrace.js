import { box, scope } from "@weborigami/async-tree";
import codeFragment from "./codeFragment.js";
import { codeSymbol, scopeSymbol, sourceSymbol } from "./symbols.js";

export default function tracing(context, code, evaluated, result) {
  if (typeof result === "symbol") {
    return result;
  }

  if (result) {
    result = box(result);
    try {
      if (result[sourceSymbol] === undefined) {
        Object.defineProperty(result, sourceSymbol, {
          get() {
            return code.location ? codeFragment(code.location) : null;
          },
          enumerable: false,
        });
      }
      if (result[codeSymbol] === undefined) {
        Object.defineProperty(result, codeSymbol, {
          value: code,
          enumerable: false,
        });
      }
      if (result[scopeSymbol] === undefined) {
        Object.defineProperty(result, scopeSymbol, {
          get() {
            return scope(context).trees;
          },
          enumerable: false,
        });
      }
      // if (result[traceSymbol] === undefined) {
      //   Object.defineProperty(result, traceSymbol, {
      //     get() {
      //       return {
      //         value: result.valueOf?.() ?? result,
      //         source: code.location ? codeFragment(code.location) : null,
      //         evaluated: evaluated.map(format),
      //       };
      //     },
      //     enumerable: false,
      //   });
      // }
    } catch (/** @type {any} */ error) {
      // Ignore errors.
    }
  }

  return result;
}

// function format(object) {
//   if (object[traceSymbol]) {
//     return object[traceSymbol];
//   } else if (object instanceof Number || object instanceof String) {
//     return object.valueOf();
//   } else if (isStringLike(object)) {
//     return toString(object);
//   } else if (object instanceof Function) {
//     return Object.getOwnPropertyNames(object).includes("toString")
//       ? object.toString()
//       : object.name;
//   } else {
//     return object;
//   }
// }
