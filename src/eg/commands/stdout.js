import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function stdout(obj) {
  const output =
    obj !== undefined ? await ExplorableGraph.toYaml(obj) : undefined;
  if (output !== undefined) {
    console.log(output);
  }
}

stdout.usage = "stdout(obj)\tWrite obj to the standard output stream";
