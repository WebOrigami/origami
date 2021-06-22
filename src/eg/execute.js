import ExplorableGraph from "../../src/core/ExplorableGraph.js";

export default async function execute(linked) {
  if (linked instanceof Array) {
    // Function
    const [fnExpression, ...args] = linked;

    const fn =
      fnExpression instanceof Array
        ? await execute(fnExpression)
        : fnExpression;

    // Recursively evaluate args.
    const evaluated = await Promise.all(
      args.map(async (arg) => await execute(arg))
    );

    // Now apply function to the evaluated args.
    const result = ExplorableGraph.isExplorable(fn)
      ? await fn.get(...evaluated)
      : await fn(...evaluated);
    return result;
  } else {
    // Other terminal
    return linked;
  }
}
