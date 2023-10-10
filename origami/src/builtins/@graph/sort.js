import { Graph } from "@graphorigami/core";
import SortTransform from "../../common/SortTransform.js";
import addValueKeyToScope from "../../common/addValueKeyToScope.js";
import {
  getScope,
  toFunction,
  transformObject,
} from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return a new graph with the original's keys sorted
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 * @typedef {import("../../..").Invocable} Invocable
 *
 * @this {AsyncDictionary|null}
 * @param {Graphable} [graphable]
 * @param {Invocable} [keyFn]
 */
export default async function sort(graphable, keyFn) {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return undefined;
  }
  const graph = Graph.from(graphable);

  if (keyFn === undefined) {
    // Simple case: sort by graph's existing keys.
    return transformObject(SortTransform, graph);
  }
  keyFn = toFunction(keyFn);

  // Complex case: sort by a function that returns a key for each value.
  const result = Object.create(graph);

  result.keys = async function () {
    const sorted = [];
    // Get all the keys and map them to their sort keys.
    for (const key of await graph.keys()) {
      const value = await graph.get(key);
      const extendedKeyFn = addValueKeyToScope(
        getScope(this),
        keyFn,
        value,
        key
      );
      const sortKey = await extendedKeyFn(value, key);
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

sort.usage = `@sort <graph>, [keyFn]\tReturn a new graph with the original's keys sorted`;
sort.documentation = "https://graphorigami.org/cli/builtins.html#@sort";
