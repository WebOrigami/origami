import ExplorableGraph from "../core/ExplorableGraph.js";

export default class StringWithGraph extends String {
  constructor(string, variant) {
    super(string);
    this.graph = ExplorableGraph.from(variant);
  }

  toGraph() {
    return this.graph;
  }
}
