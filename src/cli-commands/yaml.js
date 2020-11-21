import YAML from "yaml";
import { loadGraphFromArgument } from "../cliShared.js";

export default async function yaml(graphArg) {
  if (!graphArg) {
    console.error(`usage:\n${yaml.usage}`);
    return;
  }
  const graph = await loadGraphFromArgument(graphArg);
  const obj = await graph.resolveText();
  const text = YAML.stringify(obj, null, 2);
  console.log(text);
}

yaml.usage = `graph yaml <graph>               Print the graph in YAML format`;
