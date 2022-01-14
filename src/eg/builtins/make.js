import SubtractKeys from "../../common/SubtractKeys.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
// import ExplorableGraph from "../../core/ExplorableGraph.js";
import MapGraph from "../../core/MapGraph.js";
import app from "./app.js";
import clean from "./clean.js";
import copy from "./copy.js";
import files from "./files.js";
import yaml from "./yaml.js";

export default async function make(virtual, destination) {
  // @ts-ignore
  virtual = virtual ? ExplorableGraph.from(virtual) : await app.call(this);
  destination = destination
    ? ExplorableGraph.from(destination)
    : // @ts-ignore
      await files.call(this);
  // const cleanGraph = await destination.get(".eg.clean.yaml");
  // const built = cleanGraph ? ExplorableGraph.from(cleanGraph) : null;
  // const real = built ? new SubtractKeys(destination, built) : destination;
  const real = destination;
  await clean(real);
  const build = new SubtractKeys(virtual, real);
  const empties = new MapGraph(build, (value) => "");
  const cleanYaml = await yaml(empties);
  destination.set(".eg.clean.yaml", cleanYaml);
  const undefineds = new MapGraph(build, (value) => undefined);
  await copy(undefineds, destination);
  await copy(build, destination);
}

make.usage = `make()\tMake real versions of any virtual files`;
