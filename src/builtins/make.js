import SubtractKeys from "../common/SubtractKeys.js";
import MapValuesGraph from "../core/MapValuesGraph.js";
import clean from "./clean.js";
import copy from "./copy.js";
import meta from "./meta.js";
import reals from "./reals.js";
import yaml from "./yaml.js";

/**
 * Make the virtual values in a graph real.
 *
 * @this {Explorable}
 * @param {GraphVariant} variant
 */
export default async function make(variant) {
  const graph = await meta.call(this, variant);
  await clean(graph);
  // const plainGraphStart = await ExplorableGraph.plain(graph);
  const real = await reals(graph);
  // const plainReal = await ExplorableGraph.plain(real);
  const build = new SubtractKeys(graph, real);
  // const plainBuild = await ExplorableGraph.plain(build);
  const undefineds = new MapValuesGraph(build, (value) => undefined, {
    deep: true,
  });
  // const plainUndefineds = await ExplorableGraph.plain(undefineds);
  const cleanYaml = await yaml(undefineds);
  await graph.set(".ori.clean.yaml", cleanYaml);
  await copy(undefineds, graph);
  await copy(build, graph);
  // const plainGraphEnd = await ExplorableGraph.plain(graph);
}

make.usage = `make\tMake real versions of any virtual values [experimental]`;
make.documentation = "https://explorablegraph.org/cli/builtins.html#make";
