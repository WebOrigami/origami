import SubtractKeys from "../../common/SubtractKeys.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
// import ExplorableGraph from "../../core/ExplorableGraph.js";
import MapGraph from "../../core/MapGraph.js";
import app from "./app.js";
import copy from "./copy.js";
import files from "./files.js";
import yaml from "./yaml.js";

export default async function make(virtual, destination) {
  virtual = virtual ?? (await app());
  const virtualPlain = await ExplorableGraph.plain(virtual);
  destination = destination ?? (await files());
  const cleanFile = await destination.get(".eg.clean.yaml");
  const built = cleanFile ? ExplorableGraph.from(cleanFile) : null;
  const real = built ? new SubtractKeys(destination, built) : destination;
  const realPlain = await ExplorableGraph.plain(real);
  const build = new SubtractKeys(virtual, real);
  const buildPlain = await ExplorableGraph.plain(build);
  const structure = new MapGraph(build, (value) => "");
  const cleanYaml = await yaml(structure);
  destination.set(".eg.clean.yaml", cleanYaml);
  const undefineds = new MapGraph(build, (value) => undefined);
  const undefinedsPlain = await ExplorableGraph.plain(undefineds);
  await copy(undefineds, destination);
  await copy(build, destination);
}

make.usage = `make()\tMake real versions of any virtual files`;
