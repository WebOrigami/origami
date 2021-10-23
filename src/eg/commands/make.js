import SubtractKeys from "../../common/SubtractKeys.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import app from "./app.js";
import copy from "./copy.js";
import files from "./files.js";

export default async function make(/* virtual, destination */) {
  const virtual = await app();
  const destination = await files();
  // const cleanFile = await destination.get(".eg.clean.json");
  // const built = ExplorableGraph.from(cleanFile);
  // const real = new Subtract(destination, built);
  const real = destination;
  const build = new SubtractKeys(virtual, real);
  const plain = await ExplorableGraph.plain(build);
  // const structure = new ExplorableMap(build, (value) => null);
  // destination.set(".eg.clean.json", structure);
  await copy(build, destination);
}

make.usage = `make()\tMake real versions of any virtual files`;
