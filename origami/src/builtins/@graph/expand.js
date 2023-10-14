import { Graph } from "@graphorigami/core";
import MapValuesGraph from "../../common/MapValuesGraph.js";
import assertScopeIsDefined from "../../language/assertScopeIsDefined.js";

/**
 * Expand values that can be treated as graphs into graphs.
 *
 * @typedef {import("@graphorigami/types").AsyncDictionary} AsyncDictionary
 * @typedef {import("@graphorigami/core").Treelike} Graphable
 * @this {AsyncDictionary|null}
 * @param {Graphable} [graphable]
 */
export default async function expand(graphable) {
  assertScopeIsDefined(this);
  graphable = graphable ?? (await this?.get("@current"));
  if (graphable === undefined) {
    return undefined;
  }
  const expanded = new MapValuesGraph(
    graphable,
    (value) => expandValue(value),
    {
      deep: true,
    }
  );
  return expanded;
}

function expandValue(value) {
  let result;
  if (Graph.isTreelike(value)) {
    try {
      result = Graph.from(value);
    } catch (error) {
      result = value;
    }
  } else {
    result = value;
  }
  return result;
}

expand.usage = `@graph/expand <graph>\tExpand values that can be treated as graphs`;
expand.documentation = "https://graphorigami.org/cli/builtins.html#@graph";
