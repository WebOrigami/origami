import { loadGraphFromArgument } from "../cliShared.js";

export default async function get(graphArg, key) {
  if (!graphArg || !key) {
    console.error(`usage:\n${get.usage}`);
    return;
  }
  const graph = await loadGraphFromArgument(graphArg);
  const obj = await graph.get(key);
  console.log(String(obj));
}

get.usage = `graph get <graph> <key>          Print the graph object with the given key`;
