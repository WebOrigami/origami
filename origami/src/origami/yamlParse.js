import helpRegistry from "../common/helpRegistry.js";
import * as serialize from "../common/serialize.js";
import { toString } from "../common/utilities.js";

export default async function yamlParse(input) {
  const text = toString(input);
  return text ? serialize.parseYaml(text) : undefined;
}

helpRegistry.set("origami:yamlParse", "(text) - Parse text as YAML");
