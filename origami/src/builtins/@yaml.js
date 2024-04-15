/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import YAML from "yaml";
import * as serialize from "../common/serialize.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Render the object as text in YAML format.
 *
 * @this {AsyncTree|null}
 * @param {any} [obj]
 */
export default async function toYaml(obj) {
  assertScopeIsDefined(this, "yaml");
  // A fragment of the logic from getTreeArgument.js
  if (arguments.length > 0 && obj === undefined) {
    throw new Error(
      "An Origami function was called with an initial argument, but its value is undefined."
    );
  }
  obj = obj ?? (await this?.get("@current"));
  if (obj === undefined) {
    return undefined;
  }
  const value = await serialize.toJsonValue(obj);
  return YAML.stringify(value);
}

toYaml.usage = `@yaml <obj>\tRender the object as text in YAML format`;
toYaml.documentation = "https://weborigami.org/language/@yaml.html";
