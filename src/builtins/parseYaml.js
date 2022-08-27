import * as utilities from "../core/utilities.js";

export default async function parseYaml(text) {
  return text ? utilities.parse(String(text)) : undefined;
}

parseYaml.usage = `parseYaml <text>\tParse text as YAML (including JSON) into an object`;
parseYaml.documentation =
  "https://explorablegraph.org/cli/builtins.html#parseYaml";
