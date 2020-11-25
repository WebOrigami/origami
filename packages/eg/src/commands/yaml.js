import { asyncOps } from "@explorablegraph/exfn";
import YAML from "yaml";
import { loadGraphFromArgument } from "../shared.js";

export default async function yaml(graphArg) {
  if (!graphArg) {
    console.error(`usage:\n${yaml.usage}`);
    return;
  }
  const graph = await loadGraphFromArgument(graphArg);
  const obj = await asyncOps.strings(graph);
  const text = YAML.stringify(obj, null, 2);
  console.log(text);
}

yaml.usage = `eg yaml <graph>               Print the graph in YAML format`;
