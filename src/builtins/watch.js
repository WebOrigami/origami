import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Let a graph (e.g., of files) respond to changes.
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function watch(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }

  const graph = ExplorableGraph.from(variant);
  if ("watch" in graph) {
    await /** @type {any} */ (graph).watch();
  }

  return graph;
}

watch.usage = `watch <folder>\tLet a folder graph respond to changes`;
watch.documentation = "https://graphorigami.org/cli/builtins.html#watch";
