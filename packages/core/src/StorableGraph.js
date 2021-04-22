import ExplorableGraph from "./ExplorableGraph.js";

export default class StorableGraph extends ExplorableGraph {
  async set(...args) {
    throw `The class ${this.constructor.name} has not yet implemented the "set" method.`;
  }
}
