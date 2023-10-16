import { Dictionary, Tree } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return an array of paths to the values in the tree.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 *
 * @this {AsyncDictionary|null}
 * @param {Treelike} [treelike]
 * @param {string} [prefix]
 */
export default async function paths(treelike, prefix = "") {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const result = [];
  const tree = Tree.from(treelike);
  for (const key of await tree.keys()) {
    const valuePath = prefix ? `${prefix}/${key}` : key;
    const value = await tree.get(key);
    if (await Dictionary.isAsyncDictionary(value)) {
      const subPaths = await paths.call(this, value, valuePath);
      result.push(...subPaths);
    } else {
      result.push(valuePath);
    }
  }
  return result;
}

paths.usage = `paths(tree)\tReturn an array of paths to the values in the tree`;
