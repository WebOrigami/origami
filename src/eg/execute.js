import ExplorableGraph from "../../src/core/ExplorableGraph.js";
import ExplorableObject from "../core/ExplorableObject.js";
import { isPlainObject } from "../core/utilities.js";
import * as opcodes from "./opcodes.js";

export default async function execute(parsed, scope, graph) {
  if (parsed instanceof Array) {
    // Function
    const [fn, ...args] = parsed;

    if (fn === opcodes.quote) {
      // Don't evaluate, return argument as is.
      return args[0];
    }

    // Evaluate the function expression
    let evaluatedFn = await execute(fn, scope, graph);
    if (isPlainObject(evaluatedFn) && args.length > 0) {
      // Code wants to apply a graph-castable object as a function, so cast it
      // to a graph.
      evaluatedFn = new ExplorableObject(evaluatedFn);
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
