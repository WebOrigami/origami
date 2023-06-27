import { GraphHelpers } from "@graphorigami/core";
import { transformObject } from "../../common/utilities.js";
import InheritScopeTransform from "../../framework/InheritScopeTransform.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Reverse the order of the top-level keys in the graph.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @typedef {import("@graphorigami/core").PlainObject} PlainObject
 *
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} [variant]
 * @param {PlainObject} [options]
 */
export default async function reverse(variant, options = {}) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const scope = this;
  const graph = GraphHelpers.from(variant);
  const deep = options.deep ?? false;

  const reversed = {
    async get(key) {
      let value = await graph.get(key);

      if (deep && GraphHelpers.isAsyncDictionary(value)) {
        value = reverse.call(scope, value, options);
      }

      return value;
    },

    async keys() {
      const keys = Array.from(await graph.keys());
      keys.reverse();
      return keys;
    },
  };

  const result = transformObject(InheritScopeTransform, reversed);
  result.parent = scope;

  return result;
}

reverse.usage = `reverse <graph>\tReverses the order of the graph's top-level keys`;
reverse.documentation = "https://graphorigami.org/cli/builtins.html#reverse";
