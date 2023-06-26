import * as serialize from "../../core/serialize.js";

export default async function parseYaml(text) {
  return text ? serialize.parseYaml(String(text)) : undefined;
}

parseYaml.usage = `parseYaml <text>\tParse text as YAML (including JSON)`;
parseYaml.documentation =
  "https://graphorigami.org/cli/builtins.html#parseYaml";
