import ExplorableGraph from "../core/ExplorableGraph.js";

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
    // TODO: Look for best exception to throw
    throw `Couldn't find function or graph member called: ${fn}`;
  }
  return await fn.call(this, ...args);
}
