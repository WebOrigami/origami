import { Tree, isUnpackable } from "@weborigami/async-tree";
import codeFragment from "./codeFragment.js";

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

  let evaluated;
  if (code[0]?.unevaluatedArgs) {
    // Don't evaluate instructions, use as is.
    evaluated = code;
  } else {
    // Evaluate each instruction in the code.
    evaluated = await Promise.all(
      code.map((instruction) => evaluate.call(tree, instruction))
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
  try {
    result =
      fn instanceof Function
        ? await fn.call(tree, ...args) // Invoke the function
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
  // if (Tree.isAsyncTree(result) && !result.parent) {
  //   result.parent = tree;
  // }

  // To aid debugging, add the code to the result.
  // if (Object.isExtensible(result)) {
  //   try {
  //     if (code.location && !result[sourceSymbol]) {
  //       Object.defineProperty(result, sourceSymbol, {
  //         value: codeFragment(code.location),
  //         enumerable: false,
  //       });
  //     }
  //     if (!result[codeSymbol]) {
  //       Object.defineProperty(result, codeSymbol, {
  //         value: code,
  //         enumerable: false,
  //       });
  //     }
  //     if (!result[scopeSymbol]) {
  //       Object.defineProperty(result, scopeSymbol, {
  //         get() {
  //           return scope(this).trees;
  //         },
  //         enumerable: false,
  //       });
  //     }
  //   } catch (/** @type {any} */ error) {
  //     // Ignore errors.
  //   }
  // }

  return result;
}
