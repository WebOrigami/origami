import SubtractKeys from "../../common/SubtractKeys.js";
// import ExplorableGraph from "../../core/ExplorableGraph.js";
import MapGraph from "../../core/MapGraph.js";
import app from "./app.js";
import copy from "./copy.js";
import files from "./files.js";
import yaml from "./yaml.js";

export default async function make(virtual, destination) {
  virtual = virtual ?? (await app());
  destination = destination ?? (await files());
  // const cleanFile = await destination.get(".eg.clean.json");
  // const built = ExplorableGraph.from(cleanFile);
  // const real = new Subtract(destination, built);
  const real = destination;
  const build = new SubtractKeys(virtual, real);
  // const plain = await ExplorableGraph.plain(build);
  const structure = new MapGraph(build, (value) => "");
  const cleanYaml = await yaml(structure);
  destination.set(".eg.clean.yaml", cleanYaml);
  await copy(build, destination);
}

make.usage = `make()\tMake real versions of any virtual files`;
