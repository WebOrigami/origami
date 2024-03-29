import * as serialize from "../../common/serialize.js";

export default async function parseYaml(text) {
  return text ? serialize.parseYaml(String(text)) : undefined;
}

parseYaml.usage = `parseYaml <text>\tParse text as YAML (including JSON)`;
parseYaml.documentation = "https://weborigami.org/cli/builtins.html#parseYaml";
