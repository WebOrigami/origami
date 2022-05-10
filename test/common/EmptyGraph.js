export default class EmptyGraph {
  async *[Symbol.asyncIterator]() {
    /* No keys */
  }

  static get emptyGraph() {
    return emptyGraph;
  }

  async get(key) {
    /* Always undefined */
    return undefined;
  }
}

const emptyGraph = new EmptyGraph();
