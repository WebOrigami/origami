/// <reference path="./egcode.d.ts" />

import ExplorableGraph from "../core/ExplorableGraph.js";
import * as ops from "./ops.js";

/**
 * Evaluate the given code in the given context and return the result.
 *
 * @param {Code} code
 * @param {ProgramContext} context
 */
export default async function execute(code, context) {
  return await invoke.call(context, code);
}

/**
 * Evaluate the given code and return the result.
 * `this` will be the context in which the code will be evaluated.
 *
 * @this {ProgramContext}
 * @param {Code} code
 */
async function invoke(code) {
  if (code === ops.graph) {
    // ops.graph is a placeholder for the current graph.
    return this.graph;
  } else if (!(code instanceof Array)) {
    // Simple scalar; return as is.
    return code;
  }

  // Evaluate each instruction in the code.
  const evaluated = await Promise.all(
    code.map((instruction) => invoke.call(this, instruction))
  );

  // The head of the array is a graph or function, the rest are args or keys.
  let [fn, ...args] = evaluated;

  if (fn === undefined) {
    // The most common cause of an undefined function at this point is that the
    // code tried to get a member that doesn't exist in the local graph. To
    // give a better error message for that common case, we inspect the code to
    // see if it was a get.
    const name =
      code instanceof Array &&
      code[0] instanceof Array &&
      code[0][0] === ops.graph
        ? code[0][1]
        : "(unknown)";
    throw ReferenceError(`Couldn't find function or graph key: ${name}`);
  }

  try {
    const result =
      fn instanceof Function
        ? // Invoke the function
          await fn.call(this, ...args)
        : // Traverse the graph.
          await ExplorableGraph.traverseOrThrow(fn, ...args);
    return result;
  } catch (/** @type {any} */ error) {
    console.error(`An eg expression triggered an exception:`);
    console.error(error.stack);
    return undefined;
  }
}
