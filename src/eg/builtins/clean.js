import ExplorableGraph from "../../core/ExplorableGraph.js";
import MapGraph from "../../core/MapGraph.js";
import files from "./files.js";

export default async function clean(variant) {
  const graph = variant
    ? ExplorableGraph.from(variant)
    : // @ts-ignore
      await files.call(this);
  const cleanGraph = await graph.get(".eg.clean.yaml");
  if (!cleanGraph) {
    // Nothing to clean
    return;
  }
  const undefineds = new MapGraph(cleanGraph, (value) => undefined);
  // @ts-ignore
  await graph.set(undefineds);
}

clean.usage = `clean(graph)\tRemoves files created by the make command [experimental]`;
