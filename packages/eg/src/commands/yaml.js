import { asyncOps } from "@explorablegraph/core";
import YAML from "yaml";

export default async function yaml(graph) {
  const obj = await asyncOps.strings(graph);
  const text = YAML.stringify(obj);
  return text;
}

yaml.usage = `yaml(graph)\tPrint the graph in YAML format`;
