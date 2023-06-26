import { GraphHelpers } from "@graphorigami/core";

export default class StringWithGraph extends String {
  constructor(string, variant) {
    super(string);
    this.graph = GraphHelpers.from(variant);
  }

  toGraph() {
    return this.graph;
  }
}
