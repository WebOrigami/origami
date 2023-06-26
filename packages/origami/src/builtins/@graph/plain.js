/** @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary */
import { GraphHelpers } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the interior nodes of the graph.
 *
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} [variant]
 */
export default async function plain(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  return GraphHelpers.plain(variant);
}

plain.usage = `plain <graph>\tA plain JavaScript object representation of the graph`;
plain.documentation = "https://graphorigami.org/cli/builtins.html#plain";
