import YAML from "yaml";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { isPlainObject } from "../../core/utilities.js";

export default async function yaml(graph) {
  // Leave objects/arrays as is, but stringify other types.
  const plain = await ExplorableGraph.mapValues(graph, (value) =>
    isPlainObject(value) || value instanceof Array ? value : value?.toString?.()
  );
  const text = YAML.stringify(plain);
  return text;
}

yaml.usage = `yaml(graph)\tPrint the graph in YAML format`;
