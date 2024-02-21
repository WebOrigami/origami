/** @typedef {import("@weborigami/types").AsyncTree} AsyncTree */
import * as serialize from "../common/serialize.js";
import assertScopeIsDefined from "../misc/assertScopeIsDefined.js";

/**
 * Render the given object in JSON format.
 *
 * @this {AsyncTree|null}
 * @param {any} [obj]
 */
export default async function json(obj) {
  assertScopeIsDefined(this, "json");
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
  if (typeof obj.unpack === "function") {
    obj = await obj.unpack();
  }
  const value = await serialize.toJsonValue(obj);
  return JSON.stringify(value, null, 2);
}

json.usage = "@json <obj>\tRender the object as text in JSON format";
json.documentation = "https://weborigami.org/language/@json.html";
