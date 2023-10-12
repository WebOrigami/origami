import { Dictionary, Graph } from "@graphorigami/core";
import format from "./format.js";
import * as ops from "./ops.js";

const expressionSymbol = Symbol("expression");

/**
 * Evaluate the given code and return the result.
 *
 * `this` should be the scope used to look up references found in the code.
 *
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @typedef {import("./code").Code} Code
 *
 * @this {Graphable|null}
 * @param {Code} code
 */
export default async function execute(code) {
  const scope = this;

  if (code === ops.scope) {
    // ops.scope is a placeholder for the context's scope.
    return scope;
  } else if (!(code instanceof Array)) {
    // Simple scalar; return as is.
    return code;
  }

  let evaluated;
  if (code[0] === ops.lambda) {
    // Don't evaluate instructions, use as is.
    evaluated = code;
  } else {
    // Evaluate each instruction in the code.
    evaluated = await Promise.all(
      code.map((instruction) => execute.call(scope, instruction))
    );
  }

  // The head of the array is a graph or function, the rest are args or keys.
  let [fn, ...args] = evaluated;

  if (!fn) {
    // The code wants to invoke something that's not in scope.
    throw ReferenceError(
      `Couldn't find function or graph key: ${format(code[0])}`
    );
  } else if (!(fn instanceof Object)) {
    throw TypeError(`Can't invoke primitive value: ${format(code[0])}`);
  } else if (!(fn instanceof Function) && typeof fn.unpack === "function") {
    // The object has a unpack function; see if it returns a function.
    const unpacked = await fn.unpack();
    if (unpacked instanceof Function) {
      fn = unpacked;
    }
  }

  // Execute the function or traverse the graph.
  let result;
  try {
    result =
      fn instanceof Function
        ? // Invoke the function
          await fn.call(scope, ...args)
        : // Traverse the graph.
          await Graph.traverseOrThrow.call(scope, fn, ...args);
  } catch (/** @type {any} */ error) {
    const message = `Error triggered by Origami expression: ${format(code)}`;
    throw new Error(message, { cause: error });
  }

  // To aid debugging, add the expression source to the result.
  if (
    result &&
    typeof result === "object" &&
    Object.isExtensible(result) &&
    !Dictionary.isPlainObject(result)
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
