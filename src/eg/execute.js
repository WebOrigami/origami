import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import * as opcodes from "./opcodes.js";

export default async function execute(parsed, scope, graph) {
  if (parsed instanceof Array) {
    // Function
    const [fn, ...args] = parsed;

    if (fn === opcodes.quote) {
      // Don't evaluate, concatenate the arguments as is.
      return String.prototype.concat(...args);
    }

    // Evaluate the function expression
    let evaluatedFn = await execute(fn, scope, graph);

    if (
      args.length > 0 &&
      typeof evaluatedFn !== "function" &&
      ExplorableGraph.canCastToExplorable(evaluatedFn)
    ) {
      // Use the graph-castable object as a function.
      evaluatedFn = ExplorableGraph.from(evaluatedFn);
    }

    if (evaluatedFn === undefined) {
      // TODO: Look for best exception to throw
      throw `Couldn't find function or graph member called: ${fn}`;
    }

    // Recursively evaluate args.
    const evalutedArgs = await Promise.all(
      args.map(async (arg) => await execute(arg, scope, graph))
    );

    // Now apply function to the evaluated args.
    const result = ExplorableGraph.isExplorable(evaluatedFn)
      ? await evaluatedFn.get(...evalutedArgs)
      : typeof evaluatedFn === "function"
      ? await evaluatedFn.call(graph, ...evalutedArgs)
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
