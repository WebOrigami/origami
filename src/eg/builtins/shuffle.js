import ShuffleTransform from "../../common/ShuffleTransform.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { transformObject } from "../../core/utilities.js";

/**
 * Return a new graph with the original's keys shuffled
 *
 * @this {Explorable}
 * @param {GraphVariant} [variant]
 */
export default function shuffle(variant) {
  variant = variant ?? this;
  const graph = ExplorableGraph.from(variant);
  const shuffled = transformObject(ShuffleTransform, graph);
  return shuffled;
}

shuffle.usage = `shuffle <graph>\tReturn a new graph with the original's keys shuffled`;
