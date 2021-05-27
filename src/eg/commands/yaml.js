import YAML from "yaml";
import ExplorableGraph from "../../core/ExplorableGraph.js";

export default async function yaml(graph) {
  const strings = await ExplorableGraph.strings(graph);
  const text = YAML.stringify(strings);
  return text;
}

yaml.usage = `yaml(graph)\tPrint the graph in YAML format`;
