import { Dictionary, Graph } from "@graphorigami/core";
import format from "./format.js";
import * as ops from "./ops.js";

const expressionSymbol = Symbol("expression");

/**
 * Evaluate the given code and return the result.
 *
 * `this` should be the scope used to look up references found in the code.
 *
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @typedef {import("./code").Code} Code
 *
 * @this {GraphVariant|null}
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

  if (fn === undefined) {
    // The most common cause of an undefined function at this point is that the
    // code tried to get a member that doesn't exist in the local graph.
    const unknownFunction = format(code[0]);
    throw ReferenceError(
      `Couldn't find function or graph key: ${unknownFunction}`
    );
  }

  // If the "function" is currently an object with a .toFunction() method, get
  // the real function from that.
  if (typeof fn !== "function" && fn?.toFunction) {
    fn = fn.toFunction();
  }

  const isFunction = fn instanceof Function;
  if (!isFunction && args.length === 0) {
    args.push(undefined);
  }

  // Execute the function or traverse the graph.
  let result;
  try {
    result = isFunction
      ? // Invoke the function
        await fn.call(scope, ...args)
      : // Traverse the graph.
        await Graph.traverseOrThrow(fn, ...args);
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
