import { Tree, isUnpackable } from "@weborigami/async-tree";
import codeFragment from "./codeFragment.js";
import { ops } from "./internal.js";

/**
 * Evaluate the given code and return the result.
 *
 * `this` should be the tree used as the context for the evaluation.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {import("../../index.ts").AnnotatedCode} code
 */
export default async function evaluate(code) {
  if (!(code instanceof Array)) {
    // Simple scalar; return as is.
    return code;
  }

  // const tree = this;
  const context = this;

  let trace = {
    code,
    expression: codeFragment(code.location),
    /** @type {any[]} */
    inputs: [],
  };
  if (context) {
    /** @type {any} */ (context).trace = trace;
  }

  let evaluated;
  const unevaluatedFns = [
    ops.external,
    ops.lambda,
    ops.merge,
    ops.object,
    ops.literal,
  ];
  if (unevaluatedFns.includes(code[0])) {
    // Don't evaluate instructions, use as is.
    evaluated = code;
  } else {
    // Evaluate each instruction in the code.
    evaluated = await Promise.all(
      code.map(async (instruction, index) => {
        const inputContext = Object.create(context);
        const result = await evaluate.call(inputContext, instruction);
        if (inputContext.hasOwnProperty("trace")) {
          trace.inputs[index] = inputContext.trace;
        }
        return result;
      })
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

  // Execute the function or traverse the tree.
  let result;
  const callContext = context ? Object.create(context) : null;
  try {
    result =
      fn instanceof Function
        ? await fn.call(callContext, ...args) // Invoke the function
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

  // If the result is a tree, then the default parent of the tree is the current
  // tree.
  if (Tree.isAsyncTree(result) && !result.parent) {
    result.parent = context;
  }

  // Add information to aid debugging
  trace.result = result;
  if (callContext?.hasOwnProperty("trace")) {
    trace.call = callContext.trace;
  }

  return result;
}
