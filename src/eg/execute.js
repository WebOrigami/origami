import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import * as opcodes from "./opcodes.js";

export default async function execute(parsed, scope, graph) {
  if (parsed instanceof Array) {
    // Executable code
    const [fn, ...args] = parsed;

    const context = { scope, graph };

    let evaluatedFn =
      typeof fn === "symbol" // opcode?
        ? opcodes.ops[fn]
        : await execute(fn, scope, graph);

    // Recursively evaluate the args.
    const evaluatedArgs = await Promise.all(
      args.map(async (arg) => await execute(arg, scope, graph))
    );

    if (evaluatedArgs.length > 0) {
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
      ? await evaluatedFn.call(context, ...evaluatedArgs)
      : evaluatedArgs.length === 0
      ? evaluatedFn
      : undefined;
    return result;
  } else {
    // Not executable; return as is.
    return parsed;
  }
}
