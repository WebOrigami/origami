import { toString } from "@weborigami/async-tree";
import * as serialize from "../common/serialize.js";

export default async function yamlParse(input) {
  const text = toString(input);
  return text ? serialize.parseYaml(text) : undefined;
}
