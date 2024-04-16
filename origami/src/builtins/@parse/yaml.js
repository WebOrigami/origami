import * as serialize from "../../common/serialize.js";
import { toString } from "../../common/utilities.js";

export default async function parseYaml(input) {
  const text = toString(input);
  return text ? serialize.parseYaml(text) : undefined;
}

parseYaml.usage = `parseYaml <text>\tParse text as YAML (including JSON)`;
parseYaml.documentation = "https://weborigami.org/cli/builtins.html#parseYaml";
