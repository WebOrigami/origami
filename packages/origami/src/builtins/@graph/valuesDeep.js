import { GraphHelpers } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the in-order exterior values of a graph as a flat array.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} [variant]
 */
export default async function valuesDeep(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  return GraphHelpers.mapReduce(variant, null, (values) => values.flat());
}

valuesDeep.usage = `valuesDeep <graph>\tThe in-order graph values as a flat array`;
valuesDeep.documentation =
  "https://graphorigami.org/cli/builtins.html#valuesDeep";
