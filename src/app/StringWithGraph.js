export default class StringWithGraph extends String {
  constructor(string, graph) {
    super(string);
    this.graph = graph;
  }

  toGraph() {
    return this.graph;
  }
}
