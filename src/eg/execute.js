import ExplorableGraph from "../core/ExplorableGraph.js";
import * as ops from "./ops.js";

export default async function execute(code, scope, graph, ctx = graph) {
  const context = { graph, scope, context: ctx };
  return await invoke.call(context, code);
}

// `this` will be the context for invoking the code.
async function invoke(code) {
  if (!(code instanceof Array)) {
    // Simple scalar; return as is.
    return code;
  }

  const evaluated = await Promise.all(
    code.map((instruction) =>
      instruction instanceof Array
        ? invoke.call(this, instruction)
        : instruction
    )
  );
  let [fn, ...args] = evaluated;
  if (typeof fn !== "function" && ExplorableGraph.canCastToExplorable(fn)) {
    // Use the graph-castable object as a function.
    fn = ExplorableGraph.toFunction(fn);
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
  return await fn.call(this, ...args);
}
