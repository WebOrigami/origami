import virtualBuiltin from "../builtins/virtual.js";
import SubtractKeys from "../common/SubtractKeys.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
// import ExplorableGraph from "../../core/ExplorableGraph.js";
import MapValuesGraph from "../core/MapValuesGraph.js";
import clean from "./clean.js";
import copy from "./copy.js";
import files from "./files.js";
import yaml from "./yaml.js";

export default async function make(virtual, destination) {
  // @ts-ignore
  virtual = virtual
    ? ExplorableGraph.from(virtual)
    : await virtualBuiltin.call(this);
  destination = destination
    ? ExplorableGraph.from(destination)
    : // @ts-ignore
      await files.call(this);
  // const cleanGraph = await destination.get(".ori.clean.yaml");
  // const built = cleanGraph ? ExplorableGraph.from(cleanGraph) : null;
  // const real = built ? new SubtractKeys(destination, built) : destination;
  const real = destination;
  await clean(real);
  const build = new SubtractKeys(virtual, real);
  const empties = new MapValuesGraph(build, (value) => "", { deep: true });
  const cleanYaml = await yaml(empties);
  destination.set(".ori.clean.yaml", cleanYaml);
  const undefineds = new MapValuesGraph(build, (value) => undefined, {
    deep: true,
  });
  await copy(undefineds, destination);
  await copy(build, destination);
}

make.usage = `make\tMake real versions of any virtual files [experimental]`;
make.documentation = "https://explorablegraph.org/cli/builtins.html#make";
