import serialize from "../../common/serialize.js";

export default async function fromYaml(text) {
  return text ? serialize.fromYaml(text) : undefined;
}

fromYaml.usage = `fromYaml <text>\tParse text as YAML`;
fromYaml.documentation = "https://graphorigami.org/cli/builtins.html#fromYaml";
