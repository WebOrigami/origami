import ExplorableGraph from "./ExplorableGraph.js";

/**
 * A graph that has a `set` method.
 *
 * This is mostly used as an interface, which is how the accompany .d.ts file
 * defines it. To create a graph that supports dynamic storage, you can just add
 * a `set` method to it; it is not necessary to subclass this class.
 */
export default class IStorableGraph extends ExplorableGraph {
  async set(...args) {
    throw `The class ${this.constructor.name} has not yet implemented the "set" method.`;
  }
}
