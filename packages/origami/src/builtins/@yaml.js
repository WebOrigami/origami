/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import YAML from "yaml";
import * as serialize from "../common/serialize.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Render the object as text in YAML format.
 *
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} [variant]
 */
export default async function toYaml(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  } else if (typeof variant === "object") {
    return serialize.toYaml(variant);
  } else {
    const serializable = serialize.serializableObject(variant);
    return YAML.stringify(serializable);
  }
}

toYaml.usage = `@yaml <obj>\tRender the object as text in YAML format`;
toYaml.documentation = "https://graphorigami.org/language/@yaml.html";
