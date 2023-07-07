import { DictionaryHelpers, GraphHelpers } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return an array of paths to the values in the graph.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 *
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} [variant]
 * @param {string} [prefix]
 */
export default async function paths(variant, prefix = "") {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const result = [];
  const graph = GraphHelpers.from(variant);
  for (const key of await graph.keys()) {
    const valuePath = prefix ? `${prefix}/${key}` : key;
    const value = await graph.get(key);
    if (await DictionaryHelpers.isAsyncDictionary(value)) {
      const subPaths = await paths.call(this, value, valuePath);
      result.push(...subPaths);
    } else {
      result.push(valuePath);
    }
  }
  return result;
}

paths.usage = `paths(graph)\tReturn an array of paths to the values in the graph`;
