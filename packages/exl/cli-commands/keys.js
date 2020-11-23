import { loadGraphFromArgument } from "../cliShared.js";

export default async function keys(graphArg) {
  if (!graphArg) {
    console.error(`usage:\n${keys.usage}`);
    return;
  }
  const graph = await loadGraphFromArgument(graphArg);
  for await (const key of graph) {
    console.log(key);
  }
}

keys.usage = `graph keys <graph>               List the top-level keys in the graph`;
