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
  virtual = virtual ? ExplorableGraph.from(virtual) : await app.call(this);
  const virtualPlain = await ExplorableGraph.plain(virtual);
  destination = destination
    ? ExplorableGraph.from(destination)
    : await files.call(this);
  // const cleanGraph = await destination.get2(".eg.clean.yaml");
  // const built = cleanGraph ? ExplorableGraph.from(cleanGraph) : null;
  // const real = built ? new SubtractKeys(destination, built) : destination;
  const real = destination;
  await clean(real);
  const realPlain = await ExplorableGraph.plain(real);
  const build = new SubtractKeys(virtual, real);
  const buildPlain = await ExplorableGraph.plain(build);
  const empties = new MapGraph(build, (value) => "");
  const cleanYaml = await yaml(empties);
  destination.set(".eg.clean.yaml", cleanYaml);
  const undefineds = new MapGraph(build, (value) => undefined);
  const undefinedsPlain = await ExplorableGraph.plain(undefineds);
  await copy(undefineds, destination);
  await copy(build, destination);
}

make.usage = `make()\tMake real versions of any virtual files`;
