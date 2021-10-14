import ExplorableGraph from "../core/ExplorableGraph.js";

export async function invoke(code) {
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
    const graph = ExplorableGraph.from(fn);
    fn = graph.get.bind(graph);
  }
  if (fn === undefined) {
    // TODO: Look for best exception to throw
    throw `Couldn't find function or graph member called: ${fn}`;
  }
  return await fn.call(this, ...args);
}

export async function get(key) {
  return (await this.scope.get(key)) ?? (await this.graph.get(key));
}
get.toString = () => "«ops.get»";

export async function quote(...args) {
  return String.prototype.concat(...args);
}
quote.toString = () => "«ops.quote»";

export async function variable() {
  throw "Error: tried to execute a variable that was never bound.";
}
variable.toString = () => "«ops.variable»";
