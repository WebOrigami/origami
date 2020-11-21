import { loadGraphFromArgument } from "../cliShared.js";
import Graph from "../Graph.js";

export default async function objects(graphArg) {
  if (!graphArg) {
    console.error(`usage:\n${objects.usage}`);
    return;
  }
  const graph = await loadGraphFromArgument(graphArg);
  for await (const key of graph) {
    const obj = await graph.get(key);
    if (!obj[Graph.isGraph]) {
      console.log(obj);
    }
  }
}

objects.usage = `graph objects <graph>            Print the top-level objects in the graph`;
