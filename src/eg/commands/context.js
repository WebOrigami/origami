import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function context(...keys) {
  return ExplorableGraph.traverse(this.context, ...keys);
}

context.usage = `context\tReturns the graph that invoked a metagraph`;
