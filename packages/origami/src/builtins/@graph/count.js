/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { GraphHelpers } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the number of keys in the graph.
 *
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} [variant]
 */
export default async function count(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = await GraphHelpers.from(variant);
  const keys = [...(await graph.keys())];
  return keys.length;
}

count.usage = `count <variant>\tReturn the number of keys in the graph`;
count.documentation = "https://graphorigami.org/cli/@graph.html#count";
