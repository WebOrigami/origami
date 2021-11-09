import ShuffleMixin from "../../common/ShuffleMixin.js";
import ExplorableGraph from "../../core/ExplorableGraph.js";
import { applyMixinToObject } from "../../core/utilities.js";

export default function shuffle(variant = this.graph) {
  const graph = ExplorableGraph.from(variant);
  const shuffled = applyMixinToObject(ShuffleMixin, graph);
  return shuffled;
}

shuffle.usage = `shuffle(graph)\tReturn a new graph with the original's keys shuffled`;
