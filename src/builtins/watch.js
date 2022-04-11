import * as fs from "fs"; // NOT the promises version used elsewhere
import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Let a graph of files respond to changes.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function watch(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }

  const graph = /** @type {any} */ (ExplorableGraph.from(variant));

  // HACK: walk up the graph tree to find a graph with a dirname.
  // Need to find a better protocol for this.
  let current = graph;
  let dirname;
  while (current) {
    if (current.dirname) {
      dirname = current.dirname;
      break;
    }
    current = current.graph;
  }

  console.log(`Watching ${dirname}`);
  const options = {
    recursive: true,
  };
  fs.watch(dirname, options, (eventType, filename) => {
    console.log(`File changed: ${filename}`);
    if (graph.onChange) {
      graph.onChange(eventType, filename);
    }
  });
  return graph;
}

watch.usage = `watch <folder>\tLet a folder graph respond to changes`;
watch.documentation = "https://explorablegraph.org/cli/builtins.html#watch";
