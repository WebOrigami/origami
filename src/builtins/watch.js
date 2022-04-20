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
  try {
    fs.watch(dirname, options, (eventType, filename) => {
      console.log(`File changed: ${filename}`);
      if (graph.onChange) {
        graph.onChange(eventType, filename);
      }
    });
  } catch (error) {
    // The hosted StackBlitz service doesn't support the recursive option on
    // fs.watch, rendering it mostly useless. In that case, we ignore it and
    // this watch() builtin will just have no effect.
    const ignore =
      error instanceof TypeError &&
      /** @type {any} */ (error).code === "ERR_FEATURE_UNAVAILABLE_ON_PLATFORM";
    if (!ignore) {
      throw error;
    }
  }
  return graph;
}

watch.usage = `watch <folder>\tLet a folder graph respond to changes`;
watch.documentation = "https://explorablegraph.org/cli/builtins.html#watch";
