import { Tree } from "@graphorigami/core";
import SortTransform from "../../common/SortTransform.js";
import addValueKeyToScope from "../../common/addValueKeyToScope.js";
import {
  getScope,
  toFunction,
  transformObject,
} from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return a new tree with the original's keys sorted
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @typedef {import("../../..").Invocable} Invocable
 *
 * @this {AsyncDictionary|null}
 * @param {Treelike} [treelike]
 * @param {Invocable|null} [invocable]
 */
export default async function sort(treelike, invocable) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  if (treelike === undefined) {
    return undefined;
  }
  const tree = Tree.from(treelike);

  if (!invocable) {
    // Simple case: sort by tree's existing keys.
    return transformObject(SortTransform, tree);
  }

  const keyFn = toFunction(invocable);

  // Complex case: sort by a function that returns a key for each value.
  const result = Object.create(tree);

  result.keys = async function () {
    const sorted = [];
    // Get all the keys and map them to their sort keys.
    for (const key of await tree.keys()) {
      const value = await tree.get(key);
      const scope = addValueKeyToScope(getScope(this), value, key);
      const sortKey = await keyFn.call(scope, value, key);
      sorted.push({ key, sortKey });
    }
    // Sort the key/sortKey pairs by sortKey.
    sorted.sort((a, b) => {
      if (a.sortKey < b.sortKey) {
        return -1;
      }
      if (a.sortKey > b.sortKey) {
        return 1;
      }
      return 0;
    });
    // Get the sorted keys
    const keys = sorted.map(({ key }) => key);
    return keys;
  };

  return result;
}

sort.usage = `@sort <tree>, [keyFn]\tReturn a new tree with the original's keys sorted`;
sort.documentation = "https://graphorigami.org/cli/builtins.html#@sort";
