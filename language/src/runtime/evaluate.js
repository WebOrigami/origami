import { Tree, isPlainObject } from "@weborigami/async-tree";
import { format, ops } from "./internal.js";

const codeSymbol = Symbol("code");
const sourceSymbol = Symbol("source");

/**
 * Evaluate the given code and return the result.
 *
 * `this` should be the scope used to look up references found in the code.
 *
 * @typedef {import("@weborigami/async-tree").Treelike} Treelike
 * @typedef {import("../../../language/src/compiler/code.js").Code} Code
 *
 * @this {Treelike|null}
 * @param {Code} code
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
    throw ReferenceError(
      `Couldn't find function or tree key: ${format(code[0])}`
    );
  }

  if (
    !(fn instanceof Function || Tree.isAsyncTree(fn)) &&
    typeof fn.unpack === "function"
  ) {
    // Unpack the object and use the result as the function or tree.
    fn = await fn.unpack();
  }

  if (!Tree.isTreelike(fn)) {
    throw TypeError(
      `Expect to invoke a function or a tree but instead got: ${format(
        code[0]
      )}`
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
    result[codeSymbol] = code;
    const location = /** @type {any} */ (code).location;
    if (location) {
      const { source, start, end } = location;
      result[sourceSymbol] = source.text.slice(start.offset, end.offset);
    }
  }

  return result;
}
