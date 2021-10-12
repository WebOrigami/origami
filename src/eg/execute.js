import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import * as opcodes from "./opcodes.js";

export default async function execute(parsed, scope, graph) {
  if (parsed instanceof Array) {
    const [fn, ...args] = parsed;

    // Function
    if (fn === opcodes.quote) {
      // Don't evaluate, concatenate the arguments as is.
      return String.prototype.concat(...args);
    }

    // Recursively evaluate the function and its args.
    const evaluated = await Promise.all(
      parsed.map(async (arg) => await execute(arg, scope, graph))
    );
    let [evaluatedFn, ...evaluatedArgs] = evaluated;

    if (args.length > 0) {
      if (
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
    }

    // Now apply function to the evaluated args.
    const result = ExplorableGraph.isExplorable(evaluatedFn)
      ? await evaluatedFn.get(...evaluatedArgs)
      : typeof evaluatedFn === "function"
      ? await evaluatedFn.call(graph, ...evaluatedArgs)
      : evaluatedArgs.length === 0
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
