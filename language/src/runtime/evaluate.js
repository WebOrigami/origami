import { Tree, isUnpackable } from "@weborigami/async-tree";
import codeFragment from "./codeFragment.js";
import { ops } from "./internal.js";
import {
  getCurrentTrace,
  traceJavaScriptFunction,
  traceOrigamiCode,
} from "./trace.js";

/**
 * Evaluate the given code and return the result.
 *
 * `this` should be the tree used as the context for the evaluation.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {import("../../index.ts").AnnotatedCode} code
 */
export default async function evaluate(code) {
  const tree = this;

  if (!(code instanceof Array)) {
    // Simple scalar; return as is.
    return code;
  }

  const trace = getCurrentTrace();
  if (trace && Object.keys(trace).length > 0) {
    // Trace object exists but isn't empty, which might mean that a call to
    // evaluate was already made in this context.
    throw new Error("Internal error recording diagnostic trace information");
  }

  let evaluated;
  const unevaluatedFns = [
    ops.external,
    ops.lambda,
    ops.merge,
    ops.object,
    ops.literal,
  ];
  const inputs = [];
  if (unevaluatedFns.includes(code[0])) {
    // Don't evaluate instructions, use as is.
    evaluated = code;
  } else {
    // Evaluate each instruction in the code.
    evaluated = await Promise.all(
      code.map(async (inputCode, index) => {
        if (!(inputCode instanceof Array)) {
          // Simple scalar; return as is.
          return inputCode;
        }
        // Evaluate the input
        const { result, trace: inputTrace } = await traceOrigamiCode.call(
          tree,
          /** @type {any} */ (inputCode)
        );
        inputs[index] = inputTrace;
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
  let callTrace;
  try {
    const resultAndTrace = await traceJavaScriptFunction(
      async () =>
        fn instanceof Function
          ? await fn.call(tree, ...args) // Invoke the function
          : await Tree.traverseOrThrow(fn, ...args) // Traverse the tree.
    );
    result = resultAndTrace.result;
    callTrace = resultAndTrace.trace;
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
    result.parent = tree;
  }

  if (trace) {
    // Save everything we did in the trace
    Object.assign(
      trace,
      {
        code,
        expression: codeFragment(code.location),
        inputs,
        result,
      },
      callTrace && Object.keys(callTrace).length > 0 && { call: callTrace }
    );

    // HACK for object literals
    if (code[0] === ops.object) {
      // Move call inputs to inputs, remove call
      trace.inputs = trace.call.inputs;
      delete trace.call;
    }
  }

  return result;
}
