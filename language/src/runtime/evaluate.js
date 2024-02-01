import { Tree, isPlainObject } from "@weborigami/async-tree";
import { format, ops } from "./internal.js";

const expressionSymbol = Symbol("expression");

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
    const message = `Error triggered by Origami expression: ${format(code)}`;
    throw new Error(message, { cause: error });
  }

  // To aid debugging, add the expression source to the result.
  if (
    result &&
    typeof result === "object" &&
    Object.isExtensible(result) &&
    !isPlainObject(result)
  ) {
    try {
      result[expressionSymbol] = format(code);
    } catch (error) {
      // Setting a Symbol-keyed property on some objects fails with `TypeError:
      // Cannot convert a Symbol value to a string` but it's unclear why
      // implicit casting of the symbol to a string occurs. Since this is not a
      // vital operation, we ignore such errors.
    }
  }

  return result;
}
