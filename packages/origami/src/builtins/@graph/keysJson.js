/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { GraphHelpers } from "@graphorigami/core";
import { getScope, transformObject } from "../../core/utilities.js";
import defaultKeysJson from "../../framework/defaultKeysJson.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Expose .keys.json for a graph.
 *
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} variant
 */
export default async function keysJson(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = GraphHelpers.from(variant);
  const result = transformObject(KeysJsonTransform, graph);
  return result;
}

function KeysJsonTransform(Base) {
  return class Static extends Base {
    async get(key) {
      let value = await super.get(key);
      if (value === undefined && key === ".keys.json") {
        const scope = getScope(this);
        value = defaultKeysJson.call(scope, this);
      } else if (GraphHelpers.isAsyncDictionary(value)) {
        value = transformObject(KeysJsonTransform, value);
      }
      return value;
    }

    async keys() {
      const keys = new Set(await super.keys());
      keys.add(".keys.json");
      return keys;
    }
  };
}
