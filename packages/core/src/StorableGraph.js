import ExplorableGraph from "./ExplorableGraph.js";

export default class StorableGraph extends ExplorableGraph {
  async set(...args) {
    throw `The class ${this.constructor.name} has not yet implemented the "set" method.`;
  }

  /**
   * Get the values from the source and set them on the target.
   * Returns the target.
   *
   * @param {ExplorableGraph} source
   */
  async update(source) {
    await source.traverse(async (route, interior, value) => {
      if (!interior) {
        await this.set(...route, value);
      }
    });
  }
}
