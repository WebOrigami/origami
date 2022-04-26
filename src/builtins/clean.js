import ExplorableGraph from "../core/ExplorableGraph.js";
import MapValuesGraph from "../core/MapValuesGraph.js";

/**
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function clean(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return;
  }
  const graph = ExplorableGraph.from(variant);
  const cleanGraph = await graph.get(".ori.clean.yaml");
  if (!cleanGraph) {
    // Nothing to clean
    return;
  }
  const undefineds = new MapValuesGraph(cleanGraph, (value) => undefined, {
    deep: true,
  });
  // @ts-ignore
  await graph.set(undefineds);
}

clean.usage = `clean <graph>\tRemoves files created by the make command [experimental]`;
clean.documentation = "https://explorablegraph.org/cli/builtins.html#clean";
