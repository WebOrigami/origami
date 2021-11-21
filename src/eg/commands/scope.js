import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function scope(...keys) {
  // @ts-ignore
  return ExplorableGraph.traverse(this.graph.scope, ...keys);
}

scope.usage = `scope([...keys])\tReturns the current scope`;
