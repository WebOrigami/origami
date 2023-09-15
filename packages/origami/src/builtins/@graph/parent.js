import { Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Returns the parent of the current graph.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").GraphVariant} GraphVariant
 *
 * @this {AsyncDictionary|null}
 * @param {GraphVariant} [variant]
 */
export default async function parent(variant) {
  assertScopeIsDefined(this);
  variant = variant ?? (await this?.get("@current"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = Graph.from(variant);
  return /** @type {any} */ (graph).parent;
}

parent.usage = `parent\tThe parent of the current graph`;
parent.documentation = "https://graphorigami.org/cli/builtins.html#parent";
