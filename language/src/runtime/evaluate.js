import { Tree, isUnpackable } from "@weborigami/async-tree";
import codeFragment from "./codeFragment.js";
import { displayWarning } from "./errors.js";
import * as symbols from "./symbols.js";

/**
 * Evaluate the given code and return the result.
 *
 * `this` should be the tree used as the context for the evaluation.
 *
 * @param {import("../../index.ts").AnnotatedCode} code
 * @param {import("../../index.ts").RuntimeState} [state]
 */
export default async function evaluate(code, state = {}) {
  if (!(code instanceof Array)) {
    // Simple scalar; return as is.
    return code;
  }

  let evaluated;
  if (code[0]?.unevaluatedArgs) {
    // Don't evaluate instructions, use as is.
    evaluated = code;
  } else {
    // Evaluate each instruction in the code.
    evaluated = await Promise.all(
      code.map((instruction) => evaluate(instruction, state))
    );
  }

  // The head of the array is a function or a tree; the rest are args or keys.
  let [fn, ...args] = evaluated;

  if (!fn) {
    // The code wants to invoke something that's couldn't be found in scope.
    const error = ReferenceError(
      `${codeFragment(code[0].location)} is not defined`
    );
    /** @type {any} */ (error).location = code.location;
    throw error;
  }

  if (isUnpackable(fn)) {
    // Unpack the object and use the result as the function or tree.
    fn = await fn.unpack();
  }

  if (fn.needsState) {
    // The function is an op that wants the runtime state
    args.push(state);
  }

  // Execute the function or traverse the tree.
  let result;
  try {
    result =
      fn instanceof Function
        ? await fn(...args) // Invoke the function
        : await Tree.traverseOrThrow(fn, ...args); // Traverse the tree.
  } catch (/** @type {any} */ error) {
    if (!error.location) {
      // Attach the location of the code we tried to evaluate.
      error.location =
        error.position !== undefined && code[error.position + 1]?.location
          ? // Use location of the argument with the given position (need to
            // offset by 1 to skip the function).
            code[error.position + 1]?.location
          : // Use overall location.
            code.location;
    }
    throw error;
  }

  if (result?.[symbols.warningSymbol]) {
    displayWarning(result[symbols.warningSymbol], code.location);
    delete result[symbols.warningSymbol];
  }

  return result;
}
