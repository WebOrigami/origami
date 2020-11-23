import { loadGraphFromArgument } from "../cliShared.js";

export default async function json(graphArg) {
  if (!graphArg) {
    console.error(`usage:\n${json.usage}`);
    return;
  }
  const graph = await loadGraphFromArgument(graphArg);
  const obj = await graph.resolveText();
  const text = JSON.stringify(obj, null, 2);
  console.log(text);
}

json.usage = `graph json <graph>               Print the graph in JSON format`;
