import ExplorableGraph from "../core/ExplorableGraph.js";

/**
 * Given a main graph of arbitrary depth, and a shallow secondary graph of
 * default values, this returns values as usual from the main graph. If a
 * requested key is missing from the main graph, but exists in the default
 * values graph, the value will be returned from that graph.
 */
export default class DefaultValues {
  constructor(graph, defaults) {
    this.original = ExplorableGraph.from(graph);
    this.graph = this.original;
    this.defaults = ExplorableGraph.from(defaults);
  }

  async allKeys() {
    return /** @type {any} */ (this.graph).allKeys?.();
  }

  async *[Symbol.asyncIterator]() {
    // Yield the graph's keys, not the defaults.
    yield* this.graph;
  }

  async get(key) {
    // Try main graph first.
    let value = await this.graph.get(key);
    if (value !== undefined || !this.defaults) {
      if (ExplorableGraph.isExplorable(value)) {
        value = Reflect.construct(this.constructor, [value, this.defaults]);
      } else if (value?.toGraph) {
        // If the value isn't a graph, but has a graph attached via a `toGraph`
        // method, wrap the toGraph method to provide default values for it.
        const original = value.toGraph.bind(value);
        value.toGraph = () => {
          const graph = original();
          return Reflect.construct(this.constructor, [graph, this.defaults]);
        };
      }
      return value;
    }

    // See if we have a default value for this key.
    const defaultValue = await this.defaults.get(key);
    if (!(defaultValue instanceof Function)) {
      // Either we have a fixed default value, or we don't have a default. In
      // either case, return that.
      return defaultValue;
    }

    // We have a default value function; give it the graph to work on.
    value = defaultValue.call(this.graph);

    return value;
  }

  get parent() {
    return /** @type {any} */ (this.graph).parent;
  }
  set parent(parent) {
    // Avoid destructive modification of the underlying graph.
    this.graph = Object.create(this.original);
    /** @type {any} */ (this.graph).parent = parent;
  }

  get scope() {
    return /** @type {any} */ (this.graph).scope;
  }

  async unwatch() {
    return /** @type {any} */ (this.graph).unwatch?.();
  }
  async watch() {
    await /** @type {any} */ (this.graph).watch?.();
  }
}
