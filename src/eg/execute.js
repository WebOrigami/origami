import ExplorableGraph from "../../src/core/ExplorableGraph.js";

export default async function execute(linked, argument) {
  if (linked instanceof Array) {
    // Function
    const [fn, ...args] = linked;

    // Recursively evaluate args.
    const evaluated = await Promise.all(
      args.map(async (arg) => await execute(arg, argument))
    );

    // Now apply function to the evaluated args.
    const result = ExplorableGraph.isExplorable(fn)
      ? await fn.get(...evaluated)
      : await fn(...evaluated);
    return result;
  } else if (linked === argumentMarker) {
    // Argument placeholder
    return argument;
  } else {
    // Other terminal
    return linked;
  }
}

export const argumentMarker = Symbol("argumentMarker");
