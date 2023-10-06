import { Dictionary, Graph } from "@graphorigami/core";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return an array of paths to the values in the graph.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 *
 * @this {AsyncDictionary|null}
 * @param {Graphable} [graphable]
 * @param {string} [prefix]
 */
export default async function paths(graphable, prefix = "") {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return undefined;
  }
  const result = [];
  const graph = Graph.from(graphable);
  for (const key of await graph.keys()) {
    const valuePath = prefix ? `${prefix}/${key}` : key;
    const value = await graph.get(key);
    if (await Dictionary.isAsyncDictionary(value)) {
      const subPaths = await paths.call(this, value, valuePath);
      result.push(...subPaths);
    } else {
      result.push(valuePath);
    }
  }
  return result;
}

paths.usage = `paths(graph)\tReturn an array of paths to the values in the graph`;
