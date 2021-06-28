import ExplorableGraph from "../../src/core/ExplorableGraph.js";

export default async function execute(parsed, scope, graph) {
  if (parsed instanceof Array) {
    // Function
    const [fn, ...args] = parsed;

    // Evaluate the function expression
    const evaluatedFn = await execute(fn, scope, graph);

    if (fn === "quote") {
      // Don't evaluate quoted arg.
      return args[0];
    }

    // Recursively evaluate args.
    const evalutedArgs = await Promise.all(
      args.map(async (arg) => await execute(arg, scope, graph))
    );

    // Now apply function to the evaluated args.
    const result = ExplorableGraph.isExplorable(evaluatedFn)
      ? await evaluatedFn.get(...evalutedArgs)
      : typeof evaluatedFn === "function"
      ? await evaluatedFn(...evalutedArgs)
      : evalutedArgs.length === 0
      ? evaluatedFn
      : undefined;
    return result;
  } else {
    // Terminal
    return parsed === "this"
      ? graph
      : (await scope.get(parsed)) ?? (await graph.get(parsed));
  }
}
