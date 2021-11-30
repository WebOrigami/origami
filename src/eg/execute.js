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
  if (!(code instanceof Array)) {
    // Simple scalar; return as is.
    return code;
  }

  const evaluated = await Promise.all(
    code.map((instruction) =>
      instruction instanceof Array
        ? // @ts-ignore
          invoke.call(this, instruction)
        : instruction
    )
  );
  let [fn, ...args] = evaluated;
  if (fn !== undefined && typeof fn !== "function") {
    if (typeof fn.toFunction === "function") {
      fn = fn.toFunction();
    } else {
      if (fn instanceof Buffer || fn instanceof ArrayBuffer) {
        // Presume the buffer contains text that represents a graph.
        fn = fn.toString();
      }
      if (ExplorableGraph.canCastToExplorable(fn)) {
        // The function is a graph. We can traverse it.
        const graph = ExplorableGraph.from(fn);
        fn = ExplorableGraph.traverse.bind(null, graph);
      }
    }
  }
  if (fn === undefined) {
    // The most common cause of an undefined function at this point is that the
    // code tried to `get` a member that doesn't exist in the local graph. To
    // give a better error message for that common case, we inspect the code to
    // see if it was a `get`.
    const name =
      code instanceof Array &&
      code[0] instanceof Array &&
      code[0][0] === ops.get
        ? code[0][1]
        : "(unknown)";
    throw ReferenceError(
      `Couldn't find function or graph member called: ${name}`
    );
  }

  let result;
  try {
    // @ts-ignore
    result = await fn.call(this, ...args);
  } catch (/** @type {any} */ error) {
    console.error(`An eg expression triggered an exception:`);
    console.error(error.stack);
  }

  return result;
}
