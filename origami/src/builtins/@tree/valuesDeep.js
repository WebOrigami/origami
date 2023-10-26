import { Tree } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return the in-order exterior values of a tree as a flat array.
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 */
export default async function valuesDeep(treelike) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  return Tree.mapReduce(treelike, null, (values) => values.flat());
}

valuesDeep.usage = `valuesDeep <tree>\tThe in-order tree values as a flat array`;
valuesDeep.documentation =
  "https://graphorigami.org/cli/builtins.html#valuesDeep";
