import ExplorableGraph from "../core/ExplorableGraph.js";

export default class ConstantGraph extends ExplorableGraph {
  constructor(value) {
    super();
    this.value = value;
  }

  async get(key) {
    return this.value;
  }

  async keys() {
    return [];
  }
}
