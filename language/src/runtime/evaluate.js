import { Tree, isPlainObject, isUnpackable } from "@weborigami/async-tree";
import { ops } from "./internal.js";

const codeSymbol = Symbol("code");
const sourceSymbol = Symbol("source");

/**
 * Evaluate the given code and return the result.
 *
 * `this` should be the scope used to look up references found in the code.
 *
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 *
 * @this {Treelike|null}
 * @param {any} code
 */
export default async function evaluate(code) {
  const scope = this;

  if (code === ops.scope) {
    // ops.scope is a placeholder for the context's scope.
    return scope;
  } else if (!(code instanceof Array)) {
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
      code.map((instruction) => evaluate.call(scope, instruction))
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
        ? await fn.call(scope, ...args) // Invoke the function
        : await Tree.traverseOrThrow(fn, ...args); // Traverse the tree.
  } catch (/** @type {any} */ error) {
    if (!error.location) {
      // Attach the location of the code we were evaluating.
      error.location = /** @type {any} */ (code).location;
    }
    throw error;
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
