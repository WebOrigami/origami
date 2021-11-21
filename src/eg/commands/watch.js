import * as fs from "fs"; // NOT the promises version used elsewhere

// @ts-ignore
export default async function watch(graph = this.graph) {
  const graphPath = graph.path;
  console.log(`Watching ${graphPath}`);
  fs.watch(graphPath, (eventType, filename) => {
    console.log(`File changed: ${filename}`);
    if (graph.onChange) {
      graph.onChange(eventType, filename);
    }
  });
  return graph;
}

watch.usage = `watch(files)\tLets a graph of files respond to changes`;
