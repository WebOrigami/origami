import { Graph } from "@graphorigami/core";
import { transformObject } from "../../common/utilities.js";
import InheritScopeTransform from "../../framework/InheritScopeTransform.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Given a graph, take the first n items from it.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} graphable
 * @param {number} n
 */
export default async function take(graphable, n) {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return undefined;
  }
  const graph = Graph.from(graphable);
  const takeGraph = {
    async keys() {
      const keys = Array.from(await graph.keys());
      return keys.slice(0, n);
    },

    async get(key) {
      return graph.get(key);
    },
  };
  const result = transformObject(InheritScopeTransform, takeGraph);
  result.parent = this;
  return result;
}

take.usage = `take graph, n\tReturn the first n items from graph`;
take.documentation = "https://graphorigami.org/cli/builtins.html#take";
