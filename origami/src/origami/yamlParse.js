import { args } from "@weborigami/async-tree";
import * as serialize from "../common/serialize.js";

/**
 * Parse the given YAML text and return the resulting value.
 *
 * @param {import("@weborigami/async-tree").Stringlike} input
 */
export default async function yamlParse(input) {
  const text = args.stringlike(input, "Origami.yamlParse");
  return text ? serialize.parseYaml(text) : undefined;
}
