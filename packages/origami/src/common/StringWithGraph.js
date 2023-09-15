import { Graph } from "@graphorigami/core";

export default class StringWithGraph extends String {
  constructor(string, variant) {
    super(string);
    this.graph = Graph.from(variant);
  }

  toGraph() {
    return this.graph;
  }
}
