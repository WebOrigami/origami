import { isUnpackable, Tree } from "@weborigami/async-tree";
import counters from "../runtime/counters.js";
import executionContext from "./executionContext.js";
import "./interop.js";

/**
 * Execute the given code and return the result.
 *
 * @typedef {import("../../index.ts").ExecutionContext} ExecutionContext
 *
 * @param {ExecutionContext} context
 */
export default async function execute(context) {
  counters.executions++;

  const { code } = context;
  if (!(code instanceof Array)) {
    // Simple scalar; return as is.
    return code;
  }

  // Start by evaluating the head of the instruction
  const [head, ...tail] = code;
  let fn = await execute({
    ...context,
    code: head,
  });

  if (!fn) {
    // The code wants to invoke something that's couldn't be found in scope.
    /** @type {any} */
    const error = new ReferenceError(
      "Couldn't find the function or map to execute.",
    );
    error.context = context; // For error formatting
    error.position = 0; // Problem was at function position
    throw error;
  }

  if (isUnpackable(fn)) {
    // Unpack the object and use the result as the function or map.
    fn = await fn.unpack();
  }

  let args;
  if (fn?.unevaluatedArgs) {
    // Use unevaluated arguments as is
    args = tail;
  } else {
    // Evaluate each instruction in the code
    args = await Promise.all(
      tail.map((instruction) =>
        execute({
          ...context,
          code: instruction,
        }),
      ),
    );
  }

  if (fn.parentAsTarget && context.parent) {
    // The function wants the code's parent as the `this` target
    fn = fn.bind(context.parent);
  }

  // Execute the function or traverse the map.
  let result;
  try {
    result = await executionContext.run(
      context,
      async () =>
        fn instanceof Function
          ? await fn(...args) // Invoke the function
          : await Tree.traverseOrThrow(fn, ...args), // Traverse the map.
    );
  } catch (/** @type {any} */ error) {
    if (!error.context) {
      error.context = context; // For error formatting
    }
    throw error;
  }

  return result;
}
