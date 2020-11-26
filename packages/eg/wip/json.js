import { asyncOps } from "@explorablegraph/exfn";
import { loadGraphFromArgument } from "../shared.js";

export default async function json(graphArg) {
  if (!graphArg) {
    console.error(`usage:\n${json.usage}`);
    return;
  }
  const graph = await loadGraphFromArgument(graphArg);
  const obj = await asyncOps.strings(graph);
  const text = JSON.stringify(obj, null, 2);
  console.log(text);
}

json.usage = `eg json <graph>               Print the graph in JSON format`;
