/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { GraphHelpers } from "@graphorigami/core";
import * as serialize from "../common/serialize.js";
import assertScopeIsDefined from "../language/assertScopeIsDefined.js";

/**
 * Render the given object in JSON format.
 *
 * @this {AsyncDictionary|null}
 * @param {any} [obj]
 */
export default async function json(obj) {
  assertScopeIsDefined(this);
  obj = obj ?? (await this?.get("@current"));
  if (obj === undefined) {
    return undefined;
  }
  if (GraphHelpers.isGraphable(obj)) {
    return serialize.toJson(obj);
  } else {
    const serializable = serialize.serializableObject(obj);
    return JSON.stringify(serializable, null, 2);
  }
}

json.usage = "@json <obj>\tRender the object as text in JSON format";
json.documentation = "https://graphorigami.org/language/@json.html";
