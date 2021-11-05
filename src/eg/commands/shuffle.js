import ShuffleMixin from "../../common/ShuffleMixin.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { applyMixinToObject } from "../../core/utilities.js";
import defaultGraph from "./defaultGraph.js";

export default function shuffle(variant = defaultGraph()) {
  const graph = ExplorableGraph.from(variant);
  return applyMixinToObject(ShuffleMixin, graph);
}

shuffle.usage = `shuffle(graph)\tReturn a new graph with the original's keys shuffled`;
