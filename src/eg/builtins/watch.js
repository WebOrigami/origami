import * as fs from "fs"; // NOT the promises version used elsewhere
import ExplorableGraph from "../../core/ExplorableGraph.js";

/**
 * Let a graph of files respond to changes.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function watch(variant) {
  variant = variant ?? this;
  const graph = /** @type {any} */ (ExplorableGraph.from(variant));
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

watch.usage = `watch <folder>\tLet a folder graph respond to changes`;
