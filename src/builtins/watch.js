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

  // Watch the indicated graph.
  const graph = ExplorableGraph.from(variant);
  await /** @type {any} */ (graph).watch?.();

  // Watch graphs in scope.
  const scope = /** @type {any} */ (graph).scope;
  await scope?.watch?.();

  return graph;
}

watch.usage = `watch <folder>\tLet a folder graph respond to changes`;
watch.documentation = "https://graphorigami.org/cli/builtins.html#watch";
