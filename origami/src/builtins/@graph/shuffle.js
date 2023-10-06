import { Graph } from "@graphorigami/core";
import ShuffleTransform from "../../common/ShuffleTransform.js";
import { transformObject } from "../../common/utilities.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Return a new graph with the original's keys shuffled
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Graphable} Graphable
 *
 * @this {AsyncDictionary|null}
 * @param {Graphable} [graphable]
 */
export default async function shuffle(graphable) {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return undefined;
  }
  const graph = Graph.from(graphable);
  const shuffled = transformObject(ShuffleTransform, graph);
  return shuffled;
}

shuffle.usage = `shuffle <graph>\tReturn a new graph with the original's keys shuffled`;
shuffle.documentation = "https://graphorigami.org/cli/builtins.html#shuffle";
