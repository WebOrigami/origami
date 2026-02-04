import { isUnpackable, Tree } from "@weborigami/async-tree";
import asyncStorage from "./asyncStorage.js";
import codeFragment from "./codeFragment.js";
import "./interop.js";

/**
 * Execute the given code and return the result.
 *
 * `this` should be the tree used as the context for the evaluation.
 *
 * @param {import("../../index.ts").AnnotatedCode} code
 * @param {import("../../index.ts").RuntimeState} [state]
 */
export default async function execute(code, state = {}) {
  if (!(code instanceof Array)) {
    // Simple scalar; return as is.
    return code;
  }

  const context = { ...state, code };

  let evaluated;
  if (code[0]?.unevaluatedArgs) {
    // Don't evaluate instructions, use as is.
    evaluated = code;
  } else {
    // Evaluate each instruction in the code.
    evaluated = await Promise.all(
      code.map((instruction) => execute(instruction, state)),
    );
  }

  // The head of the array is a function or a tree; the rest are args or keys.
  let [fn, ...args] = evaluated;

  if (!fn) {
    // The code wants to invoke something that's couldn't be found in scope.
    /** @type {any} */
    const error = ReferenceError(
      `${codeFragment(code[0].location)} is not defined`,
    );
    error.context = context; // For error formatting
    error.position = 0; // Position of the problematic instruction
    throw error;
  }

  if (isUnpackable(fn)) {
    // Unpack the object and use the result as the function or tree.
    fn = await fn.unpack();
  }

  if (fn.needsState) {
    // The function is an op that wants the runtime state
    args.push(state);
  } else if (fn.containerAsTarget && state.parent) {
    // The function wants the code's container as the `this` target
    fn = fn.bind(state.parent);
  }

  // Execute the function or traverse the tree.
  let result;
  try {
    result = await asyncStorage.run(
      context,
      async () =>
        fn instanceof Function
          ? await fn(...args) // Invoke the function
          : await Tree.traverseOrThrow(fn, ...args), // Traverse the tree.
    );
  } catch (/** @type {any} */ error) {
    if (!error.context) {
      error.context = context; // For error formatting
    }
    throw error;
  }

  return result;
}
