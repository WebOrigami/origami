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

  // What keys do we need to build?
  const build = new SubtractKeys(graph, real);
  // const plainBuild = await ExplorableGraph.plain(build);

  // Record which values we'll want to clean later.
  const nulls = new MapValuesGraph(build, () => null, {
    deep: true,
    getValue: false,
  });
  const cleanYaml = await yaml(nulls);
  await graph.set(".ori.clean.yaml", cleanYaml);

  // Construct a parallel graph of `undefined` values that can be used to erase
  // the current values in the graph.
  const undefineds = new MapValuesGraph(build, () => undefined, {
    deep: true,
    getValue: false,
  });
  // const plainUndefineds = await ExplorableGraph.plain(undefineds);

  // Clear out the current values in the graph.
  await copy(undefineds, graph);

  // Build the needed values.
  await copy(build, graph);
  // const plainGraphEnd = await ExplorableGraph.plain(graph);
}

make.usage = `make\tMake real versions of any virtual values [experimental]`;
make.documentation = "https://graphorigami.org/cli/builtins.html#make";
