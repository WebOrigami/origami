import {
  Tree,
  isPlainObject,
  isUnpackable,
  scope,
} from "@weborigami/async-tree";
import { ops } from "./internal.js";

const codeSymbol = Symbol("code");
const scopeSymbol = Symbol("scope");
const sourceSymbol = Symbol("source");

/**
 * Evaluate the given code and return the result.
 *
 * `this` should be the tree used as the context for the evaluation.
 *
 * @this {import("@weborigami/types").AsyncTree|null}
 * @param {any} code
 */
export default async function evaluate(code) {
  const tree = this;

  if (!(code instanceof Array)) {
    // Simple scalar; return as is.
    return code;
  }

  let evaluated;
  const unevaluatedFns = [ops.lambda, ops.object, ops.tree];
  if (unevaluatedFns.includes(code[0])) {
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
    throw ReferenceError(`${codeFragment(code[0])} is not defined`);
  }

  if (isUnpackable(fn)) {
    // Unpack the object and use the result as the function or tree.
    fn = await fn.unpack();
  }

  if (!Tree.isTreelike(fn)) {
    throw TypeError(
      `${codeFragment(code[0])} didn't return a function or a treelike object`
    );
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
      // Attach the location of the code we were evaluating.
      error.location = /** @type {any} */ (code).location;
    }
    throw error;
  }

  // If the result is a tree, then the default parent of the tree is the current
  // tree.
  if (Tree.isAsyncTree(result) && !result.parent) {
    result.parent = tree;
  }

  // To aid debugging, add the code to the result.
  if (
    result &&
    typeof result === "object" &&
    Object.isExtensible(result) &&
    !isPlainObject(result)
  ) {
    try {
      result[codeSymbol] = code;
      if (/** @type {any} */ (code).location) {
        result[sourceSymbol] = codeFragment(code);
      }
      if (!result[scopeSymbol]) {
        Object.defineProperty(result, scopeSymbol, {
          get() {
            return scope(result).trees;
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

function codeFragment(code) {
  if (code.location) {
    const { source, start, end } = code.location;
    return source.text.slice(start.offset, end.offset);
  } else {
    return "";
  }
}
