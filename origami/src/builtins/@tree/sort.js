import { Tree } from "@graphorigami/core";
import SortTransform from "../../common/SortTransform.js";
import addValueKeyToScope from "../../common/addValueKeyToScope.js";
import {
  getScope,
  toFunction,
  transformObject,
  treeWithScope,
} from "../../common/utilities.js";
import assertScopeIsDefined from "../../misc/assertScopeIsDefined.js";

/**
 * Return a new tree with the original's keys sorted
 *
 * @typedef {import("@graphorigami/types").AsyncTree} AsyncTree
 * @typedef {import("@graphorigami/core").Treelike} Treelike
 * @typedef {import("../../..").Invocable} Invocable
 *
 * @this {AsyncTree|null}
 * @param {Treelike} [treelike]
 * @param {Invocable|null} [invocable]
 */
export default async function sort(treelike, invocable) {
  assertScopeIsDefined(this);
  treelike = treelike ?? (await this?.get("@current"));
  const tree = Tree.from(treelike);

  let result;
  if (!invocable) {
    // Simple case: sort by tree's existing keys.
    result = transformObject(SortTransform, tree);
  } else {
    const keyFn = toFunction(invocable);

    // Complex case: sort by a function that returns a key for each value.
    result = Object.create(tree);

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
  }

  result = treeWithScope(result, this);
  return result;
}

sort.usage = `@sort <tree>, [keyFn]\tReturn a new tree with the original's keys sorted`;
sort.documentation = "https://graphorigami.org/cli/builtins.html#@sort";
