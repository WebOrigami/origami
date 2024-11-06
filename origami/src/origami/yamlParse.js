import * as serialize from "../common/serialize.js";
import { toString } from "../common/utilities.js";

export default async function yamlParse(input) {
  const text = toString(input);
  return text ? serialize.parseYaml(text) : undefined;
}

yamlParse.usage = `@yamlParse <text>\tParse text as YAML`;
yamlParse.documentation = "https://weborigami.org/builtins/@yamlParse.html";
