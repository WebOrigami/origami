/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import YAML from "yaml";
import * as serialize from "../common/serialize.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Render the object as text in YAML format.
 *
 * @this {AsyncDictionary|null}
 * @param {any} [obj]
 */
export default async function toYaml(obj) {
  assertScopeIsDefined(this);
  obj = obj ?? (await this?.get("@current"));
  if (obj === undefined) {
    return undefined;
  }
  const value = await serialize.toJsonValue(obj);
  return YAML.stringify(value);
}

toYaml.usage = `@yaml <obj>\tRender the object as text in YAML format`;
toYaml.documentation = "https://graphorigami.org/language/@yaml.html";
