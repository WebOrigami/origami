import YAML from "yaml";
import ExplorableObject from "../../core/ExplorableObject.js";

export default async function parseYaml(text) {
  const obj = YAML.parse(text);
  return ExplorableObject.explore(obj);
}

parseYaml.usage = `parseYaml(text)\tParse the text as YAML`;
