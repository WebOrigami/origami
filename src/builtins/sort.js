import SortTransform from "../common/SortTransform.js";
import ExplorableGraph from "../core/ExplorableGraph.js";
import { transformObject } from "../core/utilities.js";

/**
 * Return a new graph with the original's keys sorted
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default async function sort(variant) {
  variant = variant ?? (await this?.get("@defaultGraph"));
  if (variant === undefined) {
    return undefined;
  }
  const graph = ExplorableGraph.from(variant);
  const sort = transformObject(SortTransform, graph);
  return sort;
}

sort.usage = `sort <graph>\tReturn a new graph with the original's keys sorted`;
sort.documentation = "https://explorablegraph.org/cli/builtins.html#sort";
