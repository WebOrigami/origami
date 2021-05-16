import { AsyncExplorable, asyncGet } from "../../core/exports.js";
import { loadGraphFromArgument } from "../shared.js";

export default async function values(graphArg) {
  if (!graphArg) {
    console.error(`usage:\n${values.usage}`);
    return;
  }
  const graph = await loadGraphFromArgument(graphArg);
  for await (const key of graph) {
    const obj = await graph[asyncGet](key);
    if (!(obj instanceof AsyncExplorable)) {
      console.log(obj);
    }
  }
}

values.usage = `eg values <graph>             Print the top-level values in the graph`;
