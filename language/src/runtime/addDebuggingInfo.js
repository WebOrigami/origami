import { box, scope } from "@weborigami/async-tree";
import codeFragment from "./codeFragment.js";
import { ops } from "./internal.js";
import {
  codeSymbol,
  expressionSymbol,
  inputsSymbol,
  scopeSymbol,
} from "./symbols.js";

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
  if (typeof result === "symbol") {
    return result;
  }

  if (result) {
    result = box(result);
    try {
      if (!(codeSymbol in result)) {
        Object.defineProperty(result, codeSymbol, {
          value: code,
          enumerable: false,
        });
      }
      if (!(expressionSymbol in result)) {
        Object.defineProperty(result, expressionSymbol, {
          get() {
            return code.location ? codeFragment(code.location) : null;
          },
          enumerable: false,
        });
      }
      if (!(inputsSymbol in result)) {
        // Skip literals
        if (code[0] !== ops.literal) {
          let filtered = inputs.slice(1); // Ignore function for now
          Object.defineProperty(result, inputsSymbol, {
            value: filtered,
            enumerable: false,
          });
        }
      }
      if (!(scopeSymbol in result)) {
        Object.defineProperty(result, scopeSymbol, {
          get() {
            return context ? scope(context).trees : null;
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
